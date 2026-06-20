BEGIN;

DELETE FROM user_product
WHERE "cartId" IN (
    SELECT c.id
    FROM cart c
    JOIN "user" u
        ON u.id = c."userId"
    WHERE u.phone = '0999999999'
);

DELETE FROM cart
WHERE "userId" IN (
    SELECT id
    FROM "user"
    WHERE phone = '0999999999'
);

DELETE FROM confirm
WHERE "paymentReference" LIKE 'BENCH-%';

DELETE FROM product
WHERE details LIKE 'BENCHMARK_PRODUCT_%';

DELETE FROM company
WHERE phone = '0000000000';

DELETE FROM "user"
WHERE phone = '0999999999';

INSERT INTO "user" (
    name,
    password,
    phone,
    photo,
    "userType"
)
VALUES (
    'Benchmark User',
    'not-used-for-login',
    '0999999999',
    'benchmark-user.png',
    'user'
);

INSERT INTO company (
    name,
    location,
    phone,
    "userId"
)
VALUES (
    'Benchmark Company',
    'Damascus',
    '0000000000',
    NULL
);

INSERT INTO product (
    count,
    price,
    photo,
    details,
    "companyId",
    "deletedAt"
)
SELECT
    1000,
    (10 + (g % 100))::numeric(12, 2),
    'benchmark-product.png',
    'BENCHMARK_PRODUCT_' || g,
    c.id,
    NULL
FROM generate_series(1, 200) AS g
CROSS JOIN company c
WHERE c.phone = '0000000000';

INSERT INTO confirm (
    status,
    "paymentReference",
    "totalAmount",
    "createdAt"
)
SELECT
    'completed',
    'BENCH-' || g,
    (20 + (g % 500))::numeric(12, 2),
    NOW() - make_interval(days => (g % 30)::integer)
FROM generate_series(1, 20000) AS g;

INSERT INTO cart (
    "userId",
    price,
    "confirmId",
    version
)
SELECT
    u.id,
    cf."totalAmount",
    cf.id,
    1
FROM confirm cf
JOIN "user" u
    ON u.phone = '0999999999'
WHERE cf."paymentReference" LIKE 'BENCH-%';

INSERT INTO user_product (
    "productId",
    "cartId",
    count,
    price,
    version
)
SELECT
    p.id,
    c.id,
    1 + (numbers.order_number % 5),
    p.price,
    1
FROM cart c
JOIN confirm cf
    ON cf.id = c."confirmId"
CROSS JOIN LATERAL (
    SELECT
        REPLACE(
            cf."paymentReference",
            'BENCH-',
            ''
        )::integer AS order_number
) AS numbers
JOIN product p
    ON p.details =
       'BENCHMARK_PRODUCT_' ||
       (((numbers.order_number - 1) % 200) + 1)
WHERE cf."paymentReference" LIKE 'BENCH-%';

COMMIT;
