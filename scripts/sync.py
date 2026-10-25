"""Refresh playlist snapshots; publish only complete successful snapshots."""
import getpass
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
class ApiError(Exception):
    pass


def request_api(resource, params, key):
    url = "https://www.googleapis.com/youtube/v3/" + resource
    url += "?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"X-Goog-Api-Key": key})
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.load(response)
    except urllib.error.HTTPError as exc:
        try:
            error = json.loads(exc.read()).get("error", {})
            reasons = [x.get("reason", "unknown") for x in error.get("errors", [])]
            message = error.get("message", "Request rejected").replace(key, "[REDACTED]")
            raise ApiError("HTTP %s: %s (%s)" % (exc.code, message, ", ".join(reasons))) from None
        except (ValueError, UnicodeError):
            raise ApiError("HTTP %s" % exc.code) from None
    except (urllib.error.URLError, TimeoutError, OSError):
        raise ApiError("Network connection failed or timed out") from None



def fetch_playlist(config, key):
    meta = request_api("playlists", {"part":"snippet,contentDetails", "id":config["playlistId"]}, key).get("items", [])
    if not meta:
        raise ApiError("Playlist metadata unavailable")
    songs, seen_tokens = [], set()
    token = None
    for _ in range(20):
        params = {"part":"snippet,contentDetails", "playlistId":config["playlistId"], "maxResults":50}
        if token:
            params["pageToken"] = token
        result = request_api("playlistItems", params, key)
        for item in result.get("items", []):
            snippet = item.get("snippet", {})
            video_id = item.get("contentDetails", {}).get("videoId", "")
            if not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
                continue
            if snippet.get("title") in ("Deleted video", "Private video"):
                continue
            songs.append({"videoId":video_id,"title":snippet.get("title", ""),
                "channel":snippet.get("videoOwnerChannelTitle", ""),
                "thumbnail":snippet.get("thumbnails", {}).get("medium", {}).get("url", ""),
                "position":snippet.get("position", len(songs))})
        # Editorial playlists intentionally use only the FIRST API page.
        if config["limit"] is not None:
            songs = songs[:config["limit"]]
            break
        token = result.get("nextPageToken")
        if not token:
            break
        if token in seen_tokens:
            raise ApiError("Repeated pagination token; old snapshot retained")
        seen_tokens.add(token)
    else:
        raise ApiError("Pagination limit reached; old snapshot retained")
    if not songs:
        raise ApiError("Empty playlist; old snapshot retained")
    snippet = meta[0]["snippet"]
    thumbs = snippet.get("thumbnails", {})
    thumb = next((thumbs[k]["url"] for k in ("maxres","high","medium","default") if k in thumbs), "")
    return {**config, "sourceTitle":snippet.get("title", config["title"]),
        "thumbnail":thumb, "sourceCount":meta[0].get("contentDetails", {}).get("itemCount"),
        "updatedAt":datetime.now(timezone.utc).isoformat(), "songs":songs}


def main():
    key = os.environ.get("YOUTUBE_API_KEY") or getpass.getpass("YouTube API key (hidden): ").strip()
    if not key:
        print("Missing API key")
        return 1
    output = ROOT / "public/data"
    output.mkdir(parents=True, exist_ok=True)
    failed = 0
    for config in json.loads((ROOT / "playlists.json").read_text(encoding="utf-8")):
        try:
            snapshot = fetch_playlist(config, key)
            path = output / (config["slug"] + ".json")
            temporary = path.with_suffix(".tmp")
            temporary.write_text(json.dumps(snapshot, ensure_ascii=False, indent=2), encoding="utf-8")
            temporary.replace(path)
            print(config["title"] + ": OK (%s songs)" % len(snapshot["songs"]))
        except (ApiError, ValueError, KeyError) as exc:
            failed += 1
            print(config["title"] + ": FAILED - " + str(exc).replace(key, "[REDACTED]"))
    return int(failed > 0)

if __name__ == "__main__":
    sys.exit(main())
