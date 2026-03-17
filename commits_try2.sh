# change these to your name or email that appears in commits
AUTHOR_NAME="saki-aurora"
AUTHOR_EMAIL="skaushi@lakeheadu.ca"

# CSV header
echo "repo,repo_url,sha,author_name,author_email,author_date,summary,body" > my_commits.csv

# repo info
REPO_URL=$(git remote get-url origin)
REPO_NAME=$(echo "$REPO_URL" | sed -E 's#.*/([^/]+/[^/]+)(\.git)?$#\1#')

# append commits (pretty uses | as delimiter; body may contain newlines so we replace them with \n)
git --no-pager log --all --author="$AUTHOR_NAME" --pretty=format:'%H|%an|%ae|%ad|%s|%b' --date=iso \
  | awk -v repo="$REPO_NAME" -v url="$REPO_URL" -F'|' '{ gsub(/\r/,""); gsub(/\n/,"\\n",$0); printf "%s,%s,%s,%s,%s,%s,%s,%s\n", repo, url, $1, $2, $3, $4, $5, $6 }' \
  >> my_commits.csv
