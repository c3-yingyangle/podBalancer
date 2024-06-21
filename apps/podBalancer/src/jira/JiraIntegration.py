import base64
import json
import urllib.parse
import urllib.request
from concurrent.futures import Future, ThreadPoolExecutor
from typing import Any, Dict, List, Optional, Tuple


def queryIssues(cls: c3.JiraIntegration, jql: Optional[str], limit: Optional[int]):
    config = c3.JiraIntegration.Config.getConfig()
    secret = c3.JiraIntegration.Config.getSecret()

    if not config.username:
        raise Exception("username not set.")
    if not secret.apiToken:
        raise Exception("apiToken not set.")
    if not config.jiraUrl:
        raise Exception("jiraUrl not set.")

    return __get_issues(
        jql=jql,
        username=config.username,
        api_token=secret.apiToken,
        limit=limit,
        jira_url=config.jiraUrl,
    )


def __drill(d: Dict[str, Any], keys: List[str], default: Any = None) -> Optional[Any]:
    for key in keys:
        if d and key in d:
            d = d[key]
        else:
            return default
    return d


def __jira_query(params: dict, api_endpoint: str, headers: dict):
    request = urllib.request.Request(
        api_endpoint + "?" + urllib.parse.urlencode(params),
        headers=headers,
    )
    response = urllib.request.urlopen(request, timeout=60)
    response_unmarshalled = json.loads(response.read().decode("utf-8"))
    return response_unmarshalled


def __get_issues_advanced(
    params: dict, api_endpoint: str, headers: dict
) -> Tuple[Dict[str, Any], int]:
    response_unmarshalled = __jira_query(
        params=params, api_endpoint=api_endpoint, headers=headers
    )
    issues = response_unmarshalled.get("issues", [])
    total = response_unmarshalled.get("total", 0)
    return (issues, total)


def __get_issues(
    jql: str,
    username: str,
    api_token: str,
    offset: int = 0,
    limit: int = 100,
    jira_url: str = "https://c3energy.atlassian.net/",
    subbatch_limit: int = 100,
    concurrency: int = 4,
) -> List[Dict[str, Any]]:
    api_endpoint = jira_url + "rest/api/3/search"
    auth = base64.b64encode(f"{username}:{api_token}".encode("utf-8")).decode("utf-8")
    headers = {
        "Accept": "application/json",
        "Authorization": f"Basic {auth}",
    }

    # # Fire one query to get the total.
    params = {
        "jql": jql,
        "startAt": offset,
        "maxResults": 1,
    }
    _, total = __get_issues_advanced(
        {"jql": jql, "startAt": 0, "maxResults": 1},
        api_endpoint,
        headers,
    )

    # Only query as much as we need.
    if limit and limit > 0:
        total = min(total, limit)
        subbatch_limit = min(subbatch_limit, limit)

    # TPE to parallelize requests.
    futures: List[Future[Tuple[Dict[str, Any], int]]] = []
    with ThreadPoolExecutor(max_workers=concurrency) as tpe:
        for i in range(offset, total, subbatch_limit):
            max_results = max(subbatch_limit, total - i)
            params = {
                "jql": jql,
                "startAt": i,
                "maxResults": max_results,
            }
            f = tpe.submit(__get_issues_advanced, params, api_endpoint, headers)
            futures.append(f)

    issues = []
    for f in futures:
        sub_issues, _ = f.result()
        issues += sub_issues

    # Reformat into dict rows.
    row_dicts = []
    for issue in issues:
        key = __drill(issue, ["key"])
        summary = __drill(issue, ["fields", "summary"])
        issue_type = __drill(issue, ["fields", "issuetype", "name"])
        status = __drill(issue, ["fields", "status", "name"])
        status_category = __drill(issue, ["fields", "status", "statusCategory", "name"])
        priority = __drill(issue, ["fields", "priority", "name"])
        priority_id = __drill(issue, ["fields", "priority", "id"])
        parent_summary = __drill(issue, ["fields", "parent", "fields", "summary"], "")
        story_points = __drill(issue, ["fields", "customfield_13127"], 0.0)
        assignee = __drill(issue, ["fields", "assignee", "displayName"], "")
        fix_versions = list(
            map(
                lambda fv: __drill(fv, ["name"]),
                __drill(issue, ["fields", "fixVersions"], []) or [],
            )
        )
        labels = __drill(issue, ["fields", "labels"], "")
        resolution_date = __drill(issue, ["fields", "resolutiondate"], "")

        row_dicts.append(
            {
                "Key": key,
                "Summary": summary,
                "Issue Type": issue_type,
                "Status": status,
                "Status Category": status_category,
                "Priority": priority,
                "Parent summary": parent_summary,
                "Custom field (Story point estimate)": story_points,
                "Assignee": assignee,
                "Fix Versions": fix_versions,
                "Priority ID": priority_id,
                "Labels": labels,
                "Resolution Date": resolution_date,
                "__issue": issue,
            }
        )

    return row_dicts
