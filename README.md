
# podBalancer

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
<img width="1602" alt="Screenshot 2024-12-10 at 3 04 29 PM" src="https://github.com/user-attachments/assets/6617594e-e5ff-4132-b22d-6aec1d410daf">
<img width="814" alt="Screenshot 2024-11-27 at 11 14 39 AM" src="https://github.com/user-attachments/assets/4b364c5d-8cca-4201-9924-31c178195d0d">

5. (Optional) In the "Holidays" tab, you can add or remove any holidays
<img width="1602" alt="Screenshot 2024-12-10 at 3 04 21 PM" src="https://github.com/user-attachments/assets/6a965711-c017-4438-ae78-8b055c2a9390">

6. Navigate back to the "Burndown" tab and you should see the Burndown chart using your newly allocated engineers 
<img width="1350" alt="Screenshot 2024-12-10 at 3 04 49 PM" src="https://github.com/user-attachments/assets/8fabf825-4e73-4874-85f9-51c6d0dfa605">

7. You can also view the Tickets included in the Workstream in the "Tickets" tab:
<img width="1603" alt="Screenshot 2024-12-10 at 3 04 14 PM" src="https://github.com/user-attachments/assets/7724d9be-f037-4942-9f37-29a3c005a8bf">



## To Do

 - [ ] Add functionality to the "Add Holiday" modal form
 - [ ] Add some KPI metric tiles for total story points in a workstream, total number of tickets, avg. number of FTE from start to finish, how many days after or before the due date the workstream will be finished at the current expected completion rate
 - [ ] Add UI page with form for creating new `Person`s
 - [ ] Add restrictions on allocating a person more than 100%?
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
