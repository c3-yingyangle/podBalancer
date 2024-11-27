
# podBalancers

## Setup

Create your Jira API token here: https://id.atlassian.com/manage-profile/security/api-tokens

```
JiraIntegration.Config.setConfigValue('username', 'XXX@c3.ai') 
JiraIntegration.Config.setSecretValue('apiToken', 'XXX')
```


## How to use

1. Create a Workstream by clicking the "+" button in the Workstream card list on the left. Use a JQL query to determine which tickets should be included in this Workstream.
<img width="778" alt="Screenshot 2024-11-27 at 11 55 53 AM" src="https://github.com/user-attachments/assets/b30f8a36-b452-4843-b350-e6884426d837">

2. Once the Workstream is created, click "Manage" and then click on "Refresh Issues" to ingest the Jira tickets 
<img width="574" alt="Screenshot 2024-11-27 at 11 37 43 AM" src="https://github.com/user-attachments/assets/86b9dcb5-dcc4-4527-9f67-5b51ed5ded44">

3. In the Workstream card list, click "Analyze" to view the data for that Workstream in the tab panel on the right
<img width="301" alt="Screenshot 2024-11-27 at 11 56 14 AM" src="https://github.com/user-attachments/assets/c9d288cc-0c3b-49c7-9ed0-3629cd971b9d">

4. In the "Engineers" tab on the right, click the "+" button to add some engineers to your workstream and define their allocation and PTO. (Note that an allocation of 1 is 100%)
<img width="1606" alt="Screenshot 2024-11-27 at 11 55 17 AM" src="https://github.com/user-attachments/assets/6003bd4b-4bd9-4d93-847d-8cf7fd8f993b">
<img width="814" alt="Screenshot 2024-11-27 at 11 14 39 AM" src="https://github.com/user-attachments/assets/4b364c5d-8cca-4201-9924-31c178195d0d">

5. (Optional) In the "Holidays" tab, you can add or remove any holidays
<img width="1604" alt="Screenshot 2024-11-27 at 11 55 24 AM" src="https://github.com/user-attachments/assets/927d4789-340e-45a6-b5b7-d5037f38a6a2">

6. Navigate back to the "Burndown" tab and you should see the Burndown chart using your newly allocated engineers 
<img width="1604" alt="Screenshot 2024-11-27 at 11 54 49 AM" src="https://github.com/user-attachments/assets/bc4c8ee8-2868-4f6e-b954-85b5db88c31d">



## To Do

 - [ ] Add functionality to the "Add Holiday" modal form
 - [ ] Update Burndown data grid so that the "Pts Completed - Actual" column shows the projected actual completion for future dates (i.e. the way the line chart is doing currently)
 - [ ] Add some KPI metric tiles for total story points in a workstream, total number of tickets, avg. number of FTE from start to finish, how many days after or before the due date the workstream will be finished at the current expected completion rate
 - [ ] Add UI page with form for creating new `Person`s
 - [ ] Add restrictions on allocating a person more than 100%?
 - [ ] Add "Issues" tab to Analysis page showing a data grid of all Issues/tickets included in that Workstream?
 - [ ] Automatically select the first Workstream in the card list upon initial load, so that Analysis section isn't blank
 - [ ] Add a tab to the Analysis section "Scope" with a "Scope Change" line chart that has an ideal line being a straight horizontal line at the number of story points at the beginning of the workstream, and an actual line being the cumulative sum of story points created over time
 - [ ] On the "Engineers" tab, add a data grid showing allocation per week like this:

    | Week  | Christine | Sohan | Adam | Total |
    | ------------- | ------------- | ------------- | ------------- | ------------- |
    | 1 | 1 | 1 | 0.5 | 2.5 |
    | 2 | 1 | 1 | 0.5 | 2.5 |
    | 3 | 1 | 1 | 0 | 2 |
    | 4 | 1 | 1 | 0 | 2 |
	

 - [ ] On the "Engineers" tab, add a stacked bar chart showing allocation (same data as the allocation data grid above)
 - [ ] Add back numerical indicator to Workstreams card list
