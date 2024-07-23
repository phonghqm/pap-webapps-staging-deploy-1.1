echo "Building ..."

npm run build:stage

echo "Builded successfully..."

echo "Starting sync up the latest version..."

aws s3 sync build s3://www.keypap.medscore.io --profile easygop

echo "Synched up successfully..."

echo "Invalidation CDN"
aws cloudfront create-invalidation \
    --distribution-id E1JVSPYENU0DED \
    --paths "/*" \
    --profile easygop

aws cloudfront create-invalidation \
    --distribution-id EWZY1SQA866BH \
    --paths "/*" \
    --profile easygop


echo "Done! Please access to fpp.medscore.io to get the latest update for that!"
