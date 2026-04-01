import { check, fail, sleep } from "k6";
import http from "k6/http";
import jsonpath from "https://jslib.k6.io/jsonpath/1.0.2/index.js";

export const options = {
  cloud: {
    distribution: {
      "amazon:us:ashburn": { loadZone: "amazon:us:ashburn", percent: 100 },
    },
    apm: [],
  },
  thresholds: {},
  scenarios: {
    Scenario_1: {
      executor: "ramping-vus",
      gracefulStop: "30s",
      stages: [
        { target: 5, duration: "30s" },
        { target: 15, duration: "1m" },
        { target: 30, duration: "30s" },
        { target: 5, duration: "5s" },
        { target: 0, duration: "10s" },
      ],
      gracefulRampDown: "30s",
      exec: "scenario_1",
    },
    Imported_HAR: {
      executor: "ramping-vus",
      gracefulStop: "30s",
      stages: [
        { target: 20, duration: "1m" },
        { target: 20, duration: "3m30s" },
        { target: 0, duration: "1m" },
      ],
      gracefulRampDown: "30s",
      exec: "imported_HAR",
    },
    Imported_HAR1: {
      executor: "ramping-vus",
      gracefulStop: "30s",
      stages: [
        { target: 20, duration: "1m" },
        { target: 20, duration: "3m30s" },
        { target: 0, duration: "1m" },
      ],
      gracefulRampDown: "30s",
      exec: "imported_HAR1",
    },
    Imported_HAR2: {
      executor: "ramping-vus",
      gracefulStop: "30s",
      stages: [
        { target: 20, duration: "1m" },
        { target: 20, duration: "3m30s" },
        { target: 0, duration: "1m" },
      ],
      gracefulRampDown: "30s",
      exec: "imported_HAR2",
    },
  },
};

// Scenario: Scenario_1 (executor: ramping-vus)

export function scenario_1() {
  let response;

  // Automatically added sleep
  sleep(1);
}

// Scenario: Imported_HAR (executor: ramping-vus)

export function imported_HAR() {
  let response;

  // Automatically added sleep
  sleep(1);
}

// Scenario: Imported_HAR1 (executor: ramping-vus)

export function imported_HAR1() {
  let response;

  const vars = {};

  response = http.put(
    "https://pizza-service.trentwelling.site/api/auth",
    '{"email":"d@jwt.com","password":"diner"}',
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-ch-ua": '"Not-A.Brand";v="24", "Chromium";v="146"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    },
  );

  vars["token"] = jsonpath.query(response.json(), "$.token")[0];

  response = http.options(
    "https://pizza-service.trentwelling.site/api/auth",
    null,
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        "access-control-request-headers": "content-type",
        "access-control-request-method": "PUT",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    },
  );
  sleep(8.5);

  response = http.get(
    "https://pizza-service.trentwelling.site/api/order/menu",
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        authorization: `Bearer ${vars["token"]}`,
        "content-type": "application/json",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-ch-ua": '"Not-A.Brand";v="24", "Chromium";v="146"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    },
  );

  vars["title1"] = jsonpath.query(response.json(), "$[4].title")[0];

  response = http.options(
    "https://pizza-service.trentwelling.site/api/order/menu",
    null,
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        "access-control-request-headers": "authorization,content-type",
        "access-control-request-method": "GET",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    },
  );

  response = http.get(
    "https://pizza-service.trentwelling.site/api/franchise?page=0&limit=20&name=*",
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        authorization: `Bearer ${vars["token"]}`,
        "content-type": "application/json",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-ch-ua": '"Not-A.Brand";v="24", "Chromium";v="146"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    },
  );

  response = http.options(
    "https://pizza-service.trentwelling.site/api/franchise?page=0&limit=20&name=*",
    null,
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        "access-control-request-headers": "authorization,content-type",
        "access-control-request-method": "GET",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    },
  );
  sleep(5.4);

  response = http.get("https://pizza-service.trentwelling.site/api/user/me", {
    headers: {
      accept: "*/*",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-US,en;q=0.9",
      authorization: `Bearer ${vars["token"]}`,
      "content-type": "application/json",
      origin: "https://pizza.trentwelling.site",
      priority: "u=1, i",
      "sec-ch-ua": '"Not-A.Brand";v="24", "Chromium";v="146"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Linux"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
    },
  });

  response = http.options(
    "https://pizza-service.trentwelling.site/api/user/me",
    null,
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        "access-control-request-headers": "authorization,content-type",
        "access-control-request-method": "GET",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    },
  );
  sleep(1.4);

  response = http.post(
    "https://pizza-service.trentwelling.site/api/order",
    `{"items":[{"menuId":1,"description":"Veggie","price":0.0038},{"menuId":4,"description":"Crusty","price":0.0028},{"menuId":4,"description":"Crusty","price":0.0028},{"menuId":3,"description":"Margarita","price":0.0042},{"menuId":5,"description":"${vars["title1"]}","price":0.0099},{"menuId":5,"description":"${vars["title1"]}","price":0.0099}],"storeId":"1","franchiseId":1}`,
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        authorization: `Bearer ${vars["token"]}`,
        "content-type": "application/json",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-ch-ua": '"Not-A.Brand";v="24", "Chromium";v="146"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    },
  );

  response = http.options(
    "https://pizza-service.trentwelling.site/api/order",
    null,
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        "access-control-request-headers": "authorization,content-type",
        "access-control-request-method": "POST",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    },
  );
  sleep(1.2);

  response = http.post(
    "https://pizza-factory.cs329.click/api/order/verify",
    '{"jwt":"eyJpYXQiOjE3NzQ5OTMyNzUsImV4cCI6MTc3NTA3OTY3NSwiaXNzIjoiY3MzMjkuY2xpY2siLCJhbGciOiJSUzI1NiIsImtpZCI6Ik9TcF94VzhlM3kwNk1KS3ZIeW9sRFZMaXZXX2hnTWxhcFZSUVFQVndiY0UifQ.eyJ2ZW5kb3IiOnsiaWQiOiJ0ZHc1NyIsIm5hbWUiOiJUcmVudCBXZWxsaW5nIn0sImRpbmVyIjp7ImlkIjo0LCJuYW1lIjoiRGluZXIiLCJlbWFpbCI6ImRAand0LmNvbSJ9LCJvcmRlciI6eyJpdGVtcyI6W3sibWVudUlkIjoxLCJkZXNjcmlwdGlvbiI6IlZlZ2dpZSIsInByaWNlIjowLjAwMzh9LHsibWVudUlkIjo0LCJkZXNjcmlwdGlvbiI6IkNydXN0eSIsInByaWNlIjowLjAwMjh9LHsibWVudUlkIjo0LCJkZXNjcmlwdGlvbiI6IkNydXN0eSIsInByaWNlIjowLjAwMjh9LHsibWVudUlkIjozLCJkZXNjcmlwdGlvbiI6Ik1hcmdhcml0YSIsInByaWNlIjowLjAwNDJ9LHsibWVudUlkIjo1LCJkZXNjcmlwdGlvbiI6IkNoYXJyZWQgTGVvcGFyZCIsInByaWNlIjowLjAwOTl9LHsibWVudUlkIjo1LCJkZXNjcmlwdGlvbiI6IkNoYXJyZWQgTGVvcGFyZCIsInByaWNlIjowLjAwOTl9XSwic3RvcmVJZCI6IjEiLCJmcmFuY2hpc2VJZCI6MSwiaWQiOjE4fX0.UNaZKxa0RQrJ_Y3zbWL1rA1e5V9heVv4JKrRFi9tmsdZjuTPSBTKjOMKntT3WnTqTUM8FntqjW64V8PPl93S-St1qRVvwvFsReVXb4s1wOWEYXwz1qQNj9jaP6tQ7UsVKSygTGHgVDLe8vMya7iq4xxP5VfyUA5brJwfnPOU0kkfZ3TnLYKameMfsbPNCHGoAWNyhyepjgPSMd6RwZlObWCryMBWXiTge5GwmK8SVn0BK8y4fORg6fvclm1OLdccjd7uZuupmBDhgmW-6RZVb3Q8zHlb51u05_xFimxERLjFBDmiq1yDTck-nNj4sbl7OgRwaSgsLot-kt6kQa8L6smvHX2Vy9UdM-kbWJvwkX2NKnw7-RiFnzl0BEQAqpJZeM-rpNuIgGAJs-t3GjwNAwo4JhXpsHpS18TUieJTyE83JJguQ4pw3r4N9_vrLxEj5xm6wo1J2pb4FbZNEyKUpzCSZCFi1VLi6e_iHN9UpUxWe4gJTq_2mJFO8JC5viyvfkdg8hOwqrtLv1O9Rxz41jYT_lHTgELHBao3Me7bn-r_XoAcHWaimxp68AYOP97IQ44mOJBP_afaIsAdVeh877wDdLaFPpT8GIm7lUobiLOoJ0roTu35-xC0tdHofLyMMvIINneBE2HmetiHTISdPanFeDJMGvCcssc8d4Q7e88"}',
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        authorization: `Bearer ${vars["token"]}`,
        "content-type": "application/json",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-ch-ua": '"Not-A.Brand";v="24", "Chromium";v="146"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "sec-fetch-storage-access": "active",
      },
    },
  );

  response = http.options(
    "https://pizza-factory.cs329.click/api/order/verify",
    null,
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        "access-control-request-headers": "authorization,content-type",
        "access-control-request-method": "POST",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
      },
    },
  );
}

// Scenario: Imported_HAR2 (executor: ramping-vus)

export function imported_HAR2() {
  let response;

  const vars = {};

  // Login
  response = http.put(
    "https://pizza-service.trentwelling.site/api/auth",
    '{"email":"d@jwt.com","password":"diner"}',
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/json",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-ch-ua": '"Not-A.Brand";v="24", "Chromium";v="146"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    },
  );

  if (
    !check(response, {
      "status equals 200": (response) => response.status.toString() === "200",
    })
  ) {
    console.log(response.body);
    fail("Login was *not* 200");
  }

  vars["token"] = jsonpath.query(response.json(), "$.token")[0];

  response = http.options(
    "https://pizza-service.trentwelling.site/api/auth",
    null,
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        "access-control-request-headers": "content-type",
        "access-control-request-method": "PUT",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    },
  );
  sleep(8.5);

  // Get menu
  response = http.get(
    "https://pizza-service.trentwelling.site/api/order/menu",
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        authorization: `Bearer ${vars["token"]}`,
        "content-type": "application/json",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-ch-ua": '"Not-A.Brand";v="24", "Chromium";v="146"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    },
  );

  vars["title1"] = jsonpath.query(response.json(), "$[4].title")[0];

  response = http.options(
    "https://pizza-service.trentwelling.site/api/order/menu",
    null,
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        "access-control-request-headers": "authorization,content-type",
        "access-control-request-method": "GET",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    },
  );

  // Get franchises
  response = http.get(
    "https://pizza-service.trentwelling.site/api/franchise?page=0&limit=20&name=*",
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        authorization: `Bearer ${vars["token"]}`,
        "content-type": "application/json",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-ch-ua": '"Not-A.Brand";v="24", "Chromium";v="146"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    },
  );

  response = http.options(
    "https://pizza-service.trentwelling.site/api/franchise?page=0&limit=20&name=*",
    null,
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        "access-control-request-headers": "authorization,content-type",
        "access-control-request-method": "GET",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    },
  );
  sleep(5.4);

  response = http.get("https://pizza-service.trentwelling.site/api/user/me", {
    headers: {
      accept: "*/*",
      "accept-encoding": "gzip, deflate, br, zstd",
      "accept-language": "en-US,en;q=0.9",
      authorization: `Bearer ${vars["token"]}`,
      "content-type": "application/json",
      origin: "https://pizza.trentwelling.site",
      priority: "u=1, i",
      "sec-ch-ua": '"Not-A.Brand";v="24", "Chromium";v="146"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Linux"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-site",
    },
  });

  response = http.options(
    "https://pizza-service.trentwelling.site/api/user/me",
    null,
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        "access-control-request-headers": "authorization,content-type",
        "access-control-request-method": "GET",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    },
  );
  sleep(1.4);

  // Order pizza
  response = http.post(
    "https://pizza-service.trentwelling.site/api/order",
    `{"items":[{"menuId":1,"description":"Veggie","price":0.0038},{"menuId":4,"description":"Crusty","price":0.0028},{"menuId":4,"description":"Crusty","price":0.0028},{"menuId":3,"description":"Margarita","price":0.0042},{"menuId":5,"description":"${vars["title1"]}","price":0.0099},{"menuId":5,"description":"${vars["title1"]}","price":0.0099}],"storeId":"1","franchiseId":1}`,
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        authorization: `Bearer ${vars["token"]}`,
        "content-type": "application/json",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-ch-ua": '"Not-A.Brand";v="24", "Chromium";v="146"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    },
  );

  response = http.options(
    "https://pizza-service.trentwelling.site/api/order",
    null,
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        "access-control-request-headers": "authorization,content-type",
        "access-control-request-method": "POST",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
      },
    },
  );

  if (
    !check(response, {
      "status equals 200": (response) => response.status.toString() === "200",
    })
  ) {
    console.log(response.body);
    fail("Order pizza was *not* 200");
  }

  sleep(1.2);

  // Verify pizza
  response = http.post(
    "https://pizza-factory.cs329.click/api/order/verify",
    '{"jwt":"eyJpYXQiOjE3NzQ5OTMyNzUsImV4cCI6MTc3NTA3OTY3NSwiaXNzIjoiY3MzMjkuY2xpY2siLCJhbGciOiJSUzI1NiIsImtpZCI6Ik9TcF94VzhlM3kwNk1KS3ZIeW9sRFZMaXZXX2hnTWxhcFZSUVFQVndiY0UifQ.eyJ2ZW5kb3IiOnsiaWQiOiJ0ZHc1NyIsIm5hbWUiOiJUcmVudCBXZWxsaW5nIn0sImRpbmVyIjp7ImlkIjo0LCJuYW1lIjoiRGluZXIiLCJlbWFpbCI6ImRAand0LmNvbSJ9LCJvcmRlciI6eyJpdGVtcyI6W3sibWVudUlkIjoxLCJkZXNjcmlwdGlvbiI6IlZlZ2dpZSIsInByaWNlIjowLjAwMzh9LHsibWVudUlkIjo0LCJkZXNjcmlwdGlvbiI6IkNydXN0eSIsInByaWNlIjowLjAwMjh9LHsibWVudUlkIjo0LCJkZXNjcmlwdGlvbiI6IkNydXN0eSIsInByaWNlIjowLjAwMjh9LHsibWVudUlkIjozLCJkZXNjcmlwdGlvbiI6Ik1hcmdhcml0YSIsInByaWNlIjowLjAwNDJ9LHsibWVudUlkIjo1LCJkZXNjcmlwdGlvbiI6IkNoYXJyZWQgTGVvcGFyZCIsInByaWNlIjowLjAwOTl9LHsibWVudUlkIjo1LCJkZXNjcmlwdGlvbiI6IkNoYXJyZWQgTGVvcGFyZCIsInByaWNlIjowLjAwOTl9XSwic3RvcmVJZCI6IjEiLCJmcmFuY2hpc2VJZCI6MSwiaWQiOjE4fX0.UNaZKxa0RQrJ_Y3zbWL1rA1e5V9heVv4JKrRFi9tmsdZjuTPSBTKjOMKntT3WnTqTUM8FntqjW64V8PPl93S-St1qRVvwvFsReVXb4s1wOWEYXwz1qQNj9jaP6tQ7UsVKSygTGHgVDLe8vMya7iq4xxP5VfyUA5brJwfnPOU0kkfZ3TnLYKameMfsbPNCHGoAWNyhyepjgPSMd6RwZlObWCryMBWXiTge5GwmK8SVn0BK8y4fORg6fvclm1OLdccjd7uZuupmBDhgmW-6RZVb3Q8zHlb51u05_xFimxERLjFBDmiq1yDTck-nNj4sbl7OgRwaSgsLot-kt6kQa8L6smvHX2Vy9UdM-kbWJvwkX2NKnw7-RiFnzl0BEQAqpJZeM-rpNuIgGAJs-t3GjwNAwo4JhXpsHpS18TUieJTyE83JJguQ4pw3r4N9_vrLxEj5xm6wo1J2pb4FbZNEyKUpzCSZCFi1VLi6e_iHN9UpUxWe4gJTq_2mJFO8JC5viyvfkdg8hOwqrtLv1O9Rxz41jYT_lHTgELHBao3Me7bn-r_XoAcHWaimxp68AYOP97IQ44mOJBP_afaIsAdVeh877wDdLaFPpT8GIm7lUobiLOoJ0roTu35-xC0tdHofLyMMvIINneBE2HmetiHTISdPanFeDJMGvCcssc8d4Q7e88"}',
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        authorization: `Bearer ${vars["token"]}`,
        "content-type": "application/json",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-ch-ua": '"Not-A.Brand";v="24", "Chromium";v="146"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Linux"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
        "sec-fetch-storage-access": "active",
      },
    },
  );

  response = http.options(
    "https://pizza-factory.cs329.click/api/order/verify",
    null,
    {
      headers: {
        accept: "*/*",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        "access-control-request-headers": "authorization,content-type",
        "access-control-request-method": "POST",
        origin: "https://pizza.trentwelling.site",
        priority: "u=1, i",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "cross-site",
      },
    },
  );
}
