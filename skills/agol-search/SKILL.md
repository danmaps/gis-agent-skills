---
name: agol-search
description: Search ArcGIS Online for items using the ArcGIS REST API with environment-based credentials
---

# AGOL Search

Search ArcGIS Online (or ArcGIS Enterprise) for items using the ArcGIS REST API.

## Intent

Help users discover, inventory, and audit content in their ArcGIS Online organization by executing structured searches against the REST API. Results are returned in a clean, inspectable format.

## ⚠️ Credential Safety

**Never hard-code credentials in scripts, config files, or chat messages.**

Credentials must be read from environment variables at runtime. Before using this skill, the user should set the following Windows environment variables:

### Setting credentials (one-time setup)

Open **PowerShell** and run:

```powershell
# Persist for your user account across all sessions
[System.Environment]::SetEnvironmentVariable("AGOL_USERNAME", "<your-username>", "User")
[System.Environment]::SetEnvironmentVariable("AGOL_PASSWORD", "<your-password>", "User")

# Optional — defaults to https://www.arcgis.com if not set
[System.Environment]::SetEnvironmentVariable("AGOL_PORTAL_URL", "https://your-org.maps.arcgis.com", "User")
```

> **Restart your terminal** after setting environment variables so they take effect.

### Why environment variables?

| Approach | Risk |
|---|---|
| Hard-coded in script | Credentials leak into version control or logs |
| Pasted into agent chat | Credentials may be stored in chat history or telemetry |
| Environment variable | Credentials stay on your machine, out of code and chat |

If you are prompted for credentials during a chat session, **stop and set them as environment variables instead**.

## Inputs

- `search_query` (string) — ArcGIS REST API query string (e.g. `owner:jsmith AND type:"Feature Service"`)
- `item_types` (string[], optional) — filter to specific item types (e.g. `Feature Service`, `Web Map`, `Vector Tile Service`)
- `tags` (string[], optional) — filter by tags
- `owner` (string, optional) — filter to items owned by a specific user
- `org_id` (string, optional) — limit search to an organization
- `sort_field` (string, optional) — field to sort by (`title`, `created`, `modified`, `avgrating`, `numviews`). Default: `modified`
- `sort_order` (string, optional) — `asc` or `desc`. Default: `desc`
- `max_results` (integer, optional) — maximum items to return. Default: `100`

## Outputs

- `search_results` (array of objects) — each result contains:
  - `id` — item ID
  - `title` — item title
  - `type` — item type
  - `owner` — item owner
  - `created` — creation timestamp (ISO 8601)
  - `modified` — last modified timestamp (ISO 8601)
  - `numViews` — view count
  - `tags` — array of tag strings
  - `snippet` — item summary
  - `url` — direct link to the item
- `total_count` (integer) — total number of matching items
- `search_query_used` (string) — the exact query sent to the REST API

## Safety

- **Read-only** — this skill never creates, modifies, or deletes items
- Credentials are never logged, printed, or embedded in output artifacts
- Token is acquired per-session and not persisted to disk
- All requests use HTTPS

## Workflow

### 1. Authenticate

Read credentials from environment variables and obtain a short-lived token:

```python
import os, requests

username = os.environ["AGOL_USERNAME"]
password = os.environ["AGOL_PASSWORD"]
portal    = os.environ.get("AGOL_PORTAL_URL", "https://www.arcgis.com")

token_url = f"{portal}/sharing/rest/generateToken"
token_resp = requests.post(token_url, data={
    "username": username,
    "password": password,
    "referer":  portal,
    "f":        "json",
    "expiration": 60          # minutes
})
token_resp.raise_for_status()
token_data = token_resp.json()
if "error" in token_data:
    raise RuntimeError(f"Auth failed: {token_data['error']}")
token = token_data["token"]
```

### 2. Build the search query

Construct a query using [ArcGIS REST API search syntax](https://developers.arcgis.com/rest/users-groups-and-items/search-reference/):

| Filter | Example |
|---|---|
| Owner | `owner:jsmith` |
| Item type | `type:"Feature Service"` |
| Tags | `tags:"utilities" AND tags:"electric"` |
| Title keyword | `title:parcels` |
| Org only | `orgid:0123456789ABCDEF` |
| Modified since | `modified:[1700000000000 TO 1800000000000]` (epoch ms) |
| Combined | `owner:jsmith AND type:"Feature Service" AND tags:"water"` |

### 3. Execute the search

```python
search_url = f"{portal}/sharing/rest/search"
params = {
    "q":         search_query,
    "num":       min(max_results, 100),   # API max per page is 100
    "start":     1,
    "sortField": sort_field or "modified",
    "sortOrder": sort_order or "desc",
    "f":         "json",
    "token":     token
}

all_results = []
while True:
    resp = requests.get(search_url, params=params)
    resp.raise_for_status()
    data = resp.json()
    all_results.extend(data.get("results", []))
    next_start = data.get("nextStart", -1)
    if next_start == -1 or len(all_results) >= max_results:
        break
    params["start"] = next_start

total_count = data.get("total", len(all_results))
```

### 4. Format results

Return a clean table or structured list:

| id | title | type | owner | modified | numViews | tags |
|----|-------|------|-------|----------|----------|------|
| `abc123` | Water Mains | Feature Service | jsmith | 2025-11-02 | 342 | water, infrastructure |

### 5. Validate

- Confirm result count matches expectations
- Spot-check a few item URLs to verify they resolve
- If zero results, review the query syntax and filters

## Example Prompts

- "Search AGOL for all Feature Services owned by jsmith"
- "Find web maps tagged 'emergency' modified in the last 30 days"
- "Inventory all hosted layers in our org and export to CSV"
- "List the 20 most-viewed items in our organization"
- "Search for items with 'parcel' in the title"

## Artifacts

- `agol_search_results.csv` — tabular export of search results
- `agol_search_results.json` — raw JSON response for programmatic use

## Entrypoint

- `SKILL.md`

## Tips

- Use `*` as a wildcard query to return all items (scoped by other filters)
- The REST API returns a maximum of 10,000 items per search — use additional filters to narrow large result sets
- Combine multiple filters with `AND` / `OR` / `NOT` for precision
- Wrap multi-word item types in double quotes: `type:"Feature Service"`
- Timestamps in the REST API are epoch milliseconds — use Python's `int(datetime.timestamp() * 1000)` to convert
