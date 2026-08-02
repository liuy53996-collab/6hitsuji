#!/bin/sh
set -eu

SOURCE="/Users/bambam/Desktop/个人网页制作"
ROOT="$(cd "$(dirname "$0")" && pwd)"

rsync -a --delete \
  --exclude='.git/' \
  --exclude='.DS_Store' \
  --exclude='*.mov' \
  --exclude='.gitignore' \
  --exclude='.assetsignore' \
  --exclude='.nojekyll' \
  --exclude='wrangler.jsonc' \
  --exclude='update-from-desktop.sh' \
  "$SOURCE/" "$ROOT/"

for src in "$SOURCE"/media/*.mov; do
  [ -e "$src" ] || continue
  name="$(basename "$src" .mov)"
  ffmpeg -hide_banner -loglevel error -y -i "$src" \
    -vf "scale='if(gt(iw,960),960,iw)':-2" \
    -c:v libx264 -preset medium -crf 32 -pix_fmt yuv420p \
    -c:a aac -b:a 96k -movflags +faststart \
    "$ROOT/media/$name.mp4"
done

perl -0pi -e 's/\.mov/\.mp4/g' "$ROOT"/assets/index-*.js "$ROOT/index.html"

find "$ROOT" -path "$ROOT/.git" -prune -o \
  -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) -size +8M \
  ! -path "$ROOT/media/book/kanji-*" \
  ! -path "$ROOT/media/book/tokyo-*" \
  -exec sips -Z 2400 {} \; >/dev/null

for png in "$ROOT"/media/book/kanji-*.png; do
  [ -e "$png" ] || continue
  jpg="${png%.png}.jpg"
  sips -Z 3600 -s format jpeg -s formatOptions 90 "$png" --out "$jpg" >/dev/null
done

for png in "$ROOT"/media/book/tokyo-*.png; do
  [ -e "$png" ] || continue
  jpg="${png%.png}.jpg"
  sips -Z 3600 -s format jpeg -s formatOptions 90 "$png" --out "$jpg" >/dev/null
done

perl -0pi -e 's#media/book/kanji-(\d\d)\.png(?:\?v=[A-Za-z0-9]+)?#media/book/kanji-$1.jpg#g; s#media/book/tokyo-(\d\d)\.png(?:\?v=[A-Za-z0-9]+)?#media/book/tokyo-$1.jpg#g; s#Fb=""\+new URL\("kanji-16-BiAvSj36\.png",import\.meta\.url\)\.href#Fb="media/book/kanji-16.jpg"#; s#""\+new URL\("tokyo-(\d\d)-[^"]+\.png",import\.meta\.url\)\.href#"media/book/tokyo-$1.jpg"#g' "$ROOT"/assets/index-*.js
rm -f "$ROOT"/media/book/kanji-*.png "$ROOT"/media/book/tokyo-*.png "$ROOT"/assets/kanji-16-BiAvSj36.png "$ROOT"/assets/tokyo-*.png

too_large="$(find "$ROOT" -path "$ROOT/.git" -prune -o -type f -size +24M -print)"
if [ -n "$too_large" ]; then
  printf 'These files are still too large for Cloudflare Pages/Workers:\n%s\n' "$too_large" >&2
  exit 1
fi
