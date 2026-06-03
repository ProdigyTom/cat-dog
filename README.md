# cat-dog

An HTTP service that accepts arbitrary JSON payloads and replaces occurrences of the string `"dog"` with `"cat"`.

## Running the service

```bash
npm install
npm run dev        # development (ts-node)
```

The server listens on port `3000` by default. Set the `PORT` environment variable to override.

## API

### `POST /replace`

Accepts any valid JSON body. Returns the transformed payload alongside a count of replacements made.

**Query parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `maxReplacements` | non-negative integer | unlimited | Maximum number of replacements to perform across the entire payload |

**Example request**

```bash
curl -X POST http://localhost:3000/replace?maxReplacements=2 \
  -H "Content-Type: application/json" \
  -d '{"title": "dog show", "tags": ["dog", "animal", "dog"]}'
```

Alternatively, you can test with something like Postman to make a similar request.

**Example response**

```json
{
  "data": {
    "title": "cat show",
    "tags": ["cat", "animal", "dog"]
  },
  "replacementCount": 2
}
```

## Running tests

```bash
npm test           # single run
npm run test:watch # watch mode
```

## Assumptions

- **Keys are not modified.** Replacement applies to string values only. A key like `"dogName"` is left unchanged.
- **Replacement is case-sensitive.** Only the exact string `"dog"` is matched. `"Dog"` and `"DOG"` are left unchanged. This keeps the behaviour predictable and the implementation simple — see [Future improvements](#future-improvements) for notes on case-insensitive support.
- **Replacement is substring-based.** `"hotdog"` becomes `"hotcat"`. There is no whole-word boundary check.
- **`maxReplacements` defaults to unlimited.** This is safe because the replacement count is strictly bounded by `payload_size / 3` (the length of `"dog"`). With the 1 MB payload cap, the worst case is ~333k replacements — no memory growth, since `"dog"` and `"cat"` are the same length.
- **Payload size is capped at 1 MB.** Requests exceeding this limit are rejected with a `413` response by Express before reaching the handler.
- **`maxReplacements=0` is valid** and results in no replacements being made.

## Design decisions

### Inner functions for `walk` and `replaceInString`

The two helper functions (`walk` for recursing the JSON tree, `replaceInString` for scanning a string) are defined inside `replaceInJson` rather than at the module level. This is intentional: both functions share a single `replacementCount` counter, and each call to `replaceInJson` needs its own independent counter. Defining them within the `replaceInJson` function keeps that state naturally scoped to one invocation without needing to thread a counter object through every recursive call.

### Replacement logic uses `startsWith` with a position argument

`str.startsWith("dog", i)` checks for a match at a specific index without allocating a substring. This keeps the inner loop allocation-free, which matters under high throughput.

## Trade-offs

- **No rate limiting.** The service is stateless and horizontally scalable, but a production deployment should sit behind a rate limiter (e.g. an API gateway or middleware such as `express-rate-limit`) to guard against abuse.
- **No request tracing.** There are no request IDs or structured logs, which would be something to add before deploying to production.

## Future improvements

- **Case-insensitive matching with case-preserving replacement.** The natural next step is to support matching `"Dog"`, `"DOG"`, etc., while preserving the original casing in the replacement — `"Dog"` → `"Cat"`, `"DOG"` → `"CAT"`. This could be exposed as an optional query parameter (e.g. `caseInsensitive=true`).
- **Configurable search and replace values.** The `"dog"` → `"cat"` strings are hardcoded. Accepting them as parameters would make the service general-purpose.
- **Caching layer.** Caching for identical payloads would make this more scalable and able to handle higher load assuming that some of the payloads were repeated. 
- **Rate limiting middleware.**
- **Dockerfile and deployment config.**
