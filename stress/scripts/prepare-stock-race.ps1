param(
  [int]$Users = 100,
  [int]$Stock = 50,
  [string]$Password = 'RaceTest@123'
)

$ErrorActionPreference = 'Stop'

if ($Users -lt 2) {
  throw 'Users must be at least 2.'
}

if ($Stock -lt 1 -or $Stock -ge $Users) {
  throw 'Stock must be at least 1 and lower than Users.'
}

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
Set-Location $repoRoot

$composeArgs = @(
  'compose',
  '-f', 'docker-compose.yml',
  '-f', 'docker-compose.loadtest.yml'
)

$hashOutput = & docker @composeArgs exec -T `
  -e "RACE_PASSWORD=$Password" `
  api1 node -e "console.log(require('bcrypt').hashSync(process.env.RACE_PASSWORD, 10))"

if ($LASTEXITCODE -ne 0) {
  throw 'Could not generate the bcrypt password hash inside api1.'
}

$passwordHash = $hashOutput |
  Where-Object { $_ -match '^\$2[aby]\$' } |
  Select-Object -Last 1

if (-not $passwordHash) {
  throw 'The bcrypt password hash was not found in the api1 output.'
}

$sql = @"
BEGIN;

DELETE FROM confirm
WHERE id IN (
  SELECT c."confirmId"
  FROM cart c
  JOIN "user" u ON u.id = c."userId"
  WHERE u.phone LIKE '0997%'
    AND c."confirmId" IS NOT NULL
);

DELETE FROM "user"
WHERE phone LIKE '0997%';

DELETE FROM product
WHERE details = '__RACE_TEST_PRODUCT__';

WITH race_product AS (
  INSERT INTO product (
    "count",
    price,
    photo,
    details,
    "companyId",
    "deletedAt"
  )
  SELECT
    $Stock,
    10.00,
    'race-product.png',
    '__RACE_TEST_PRODUCT__',
    id,
    NULL
  FROM company
  ORDER BY id
  LIMIT 1
  RETURNING id
),
race_users AS (
  INSERT INTO "user" (
    name,
    password,
    phone,
    photo,
    "userType"
  )
  SELECT
    'Race User ' || n,
    '$passwordHash',
    '0997' || LPAD(n::text, 6, '0'),
    'race-user.png',
    'user'
  FROM generate_series(1, $Users) AS n
  RETURNING id
),
race_carts AS (
  INSERT INTO cart (
    "userId",
    price,
    "confirmId"
  )
  SELECT
    id,
    10.00,
    NULL
  FROM race_users
  RETURNING id
)
INSERT INTO user_product (
  "productId",
  "cartId",
  count,
  price
)
SELECT
  p.id,
  c.id,
  1,
  10.00
FROM race_product p
CROSS JOIN race_carts c;

COMMIT;

SELECT
  p.id AS race_product_id,
  p.count AS initial_stock,
  COUNT(up.id) AS prepared_carts
FROM product p
JOIN user_product up ON up."productId" = p.id
WHERE p.details = '__RACE_TEST_PRODUCT__'
GROUP BY p.id, p.count;
"@

$sql | & docker @composeArgs exec -T postgres `
  psql -U postgres -d parallel_ecommerce -v ON_ERROR_STOP=1

if ($LASTEXITCODE -ne 0) {
  throw 'Failed to prepare the PostgreSQL race-test data.'
}

$csvDirectory = Join-Path $repoRoot 'stress\jmeter'
New-Item -ItemType Directory -Path $csvDirectory -Force | Out-Null
$csvPath = Join-Path $csvDirectory 'stock-race-users.csv'

$lines = [System.Collections.Generic.List[string]]::new()
$lines.Add('phone,password')

for ($i = 1; $i -le $Users; $i++) {
  $phone = '0997{0:D6}' -f $i
  $lines.Add("$phone,$Password")
}

[System.IO.File]::WriteAllLines(
  $csvPath,
  $lines,
  [System.Text.UTF8Encoding]::new($false)
)

Write-Host ''
Write-Host "Prepared users: $Users"
Write-Host "Initial stock: $Stock"
Write-Host "CSV file: $csvPath"
Write-Host "Shared password: $Password"
