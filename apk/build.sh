#!/usr/bin/env bash
# يبني ملف APK من نفس ملفات المعمل (بيشتغل من غير نت والصوتين جوّاه)
set -euo pipefail
export KP=""
cd "$(dirname "$0")"
ROOT=..
N="${RUN_NUMBER:-1}"

rm -rf www android
mkdir -p www
cp -r "$ROOT/index.html" "$ROOT/assets" "$ROOT/voice" "$ROOT/icons" "$ROOT/manifest.webmanifest" www/
rm -f www/voice/*/README.txt
# علامة إن ده تطبيق أندرويد (من غير Service Worker ولا زر تثبيت)
sed -i 's#<head>#<head><script>window.IS_APK=1</script>#' www/index.html
grep -q 'IS_APK=1' www/index.html

npm install --no-audit --no-fund --silent
npx cap add android
npx cap sync android

A=android/app/src/main
PKG=$A/java/com/mrmohamed/physicslab
mkdir -p "$PKG"
cp java/*.java "$PKG/"
cp -r res/* $A/res/
find $A/res -name 'splash.png' -exec cp splash.png {} \;
sed -i 's#<color name="ic_launcher_background">.*</color>#<color name="ic_launcher_background">\#14204A</color>#' $A/res/values/ic_launcher_background.xml || true
sed -i "s/versionCode [0-9]*/versionCode $N/; s/versionName \"[^\"]*\"/versionName \"4.$N\"/" android/app/build.gradle

cd android
chmod +x gradlew
./gradlew --no-daemon -q assembleRelease
cd ..
BT=$(ls -d "$ANDROID_HOME"/build-tools/* | sort -V | tail -1)
U=android/app/build/outputs/apk/release/app-release-unsigned.apk
"$BT/zipalign" -f -p 4 "$U" aligned.apk
# مفتاح التوقيع من أسرار GitHub (KEYSTORE_B64 و KEYSTORE_PASS) عشان التحديثات تتثبّت فوق القديم.
# لو مش موجود، بيتعمل مفتاح مؤقت (التطبيق يشتغل، بس التحديث الجاي هيحتاج حذف القديم الأول).
if [ -n "${KEYSTORE_B64:-}" ]; then
  echo "$KEYSTORE_B64" | base64 -d > /tmp/k.keystore; export KP="$KEYSTORE_PASS"
else
  echo "::warning::مفيش مفتاح توقيع في الأسرار، هيتعمل مفتاح مؤقت"
  export KP=temp-$RANDOM$RANDOM
  keytool -genkeypair -keystore /tmp/k.keystore -alias physlab -keyalg RSA -keysize 2048 -validity 36500 -storepass "$KP" -keypass "$KP" -dname "CN=Physics Lab"
fi
"$BT/apksigner" sign --ks /tmp/k.keystore --ks-key-alias physlab --ks-pass env:KP --key-pass env:KP --out PhysicsLab.apk aligned.apk
rm -f /tmp/k.keystore
"$BT/apksigner" verify PhysicsLab.apk
ls -lh PhysicsLab.apk
