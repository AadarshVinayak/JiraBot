import api, {route} from "@forge/api";
import headers from './middlewares/headers.js'

export async function run(event, context) {
  const issueId = event.issue.id;

  // Check what the issue type is
  const issueType = await checkIssueType(issueId);
  console.log(`Issue Type: ${issueType}`);

  // Check if the issue type is CR
  if(issueType === "CR") {

	// Check if the issue update event is a transition has transitioned
	var transition = await checkIfIssueTransitioned(event);
	console.log(`Transition: ${transition}`);

	// Check if the transition is "Scheduled"
	if(transition === "Scheduled") {

		//Create the filter, get the project name and create the board.
		//const filter = await createFilter(event);
		const filter =1;
		//var projectName = getProjectName(event);
		//projectName = changeProjectToITProject(projectName);
		//console.log(`Project Name: ${projectName}`);
		await createBoard(event, "RDI", filter.id);
	}
}
}

function getProject(projectName){
	return api.asApp()
	.requestJira(route`/rest/api/3/project/${projectName}`)
	.then(response => {
	  if (response.status === 200) {
		return response.json();
	  } else {
		throw new Error(`Failed to fetch project: ${response.status}`);
	  }
	})
	.then(project => {
	  return project;
	})
	.catch(error => {
	  console.error('Error fetching project:', error);
	  throw error;
	});
}

function createBoard(event, projectName, filterId) {
	
	return api.asApp()
	.requestJira(route`/rest/agile/1.0/board`, {
		method: 'GET',
		headers: headers,
		/*body: JSON.stringify({
			filterId: filterId,
			location: {
				type: "project",
				projectKeyOrId: "RDI"
			},
			name: getSummary(event.issue),
			type: "scrum"
		})*/
	}).then(response => {
	  if (response.status === 200) {
		return response.json();
	  } else {
		throw new Error(`Failed to create board: ${response.status}`);
	  }
	})
	.catch(error => {
	  console.error('Error creating board:', error);
	  throw error;
	});
}

function getProjectName(event){
	return event.issue.fields.project.name;
}

function changeProjectToITProject(projectName){
	return (projectName + " IT");
}

function getSummary(issue){
	return issue.fields.summary;
}

function createFilter(event) {
	const summary = getSummary(event.issue);

	return api.asApp()
	.requestJira(route`/rest/api/3/filter`, {
		method: 'POST',
		body: JSON.stringify({
			name: `Filter for ${summary}`,
			jql: `parent = "${event.issue.key}"`,
			editPermissions: [
				{
					"type": "group",
					"group": {
						"name": "jira-users-ironlogicbeta"
					}
				}
			]
		}),
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'Authorization': `Basic YXZpbmF5YWtAaXJvbmxvZ2ljLmNhOkFUQVRUM3hGZkdGMDhselhsWnNkT3dlSXZoSWhZdkNVTG54Tm9ZYXpOWEcybW1hcVR5cHBUbjNBZE9SRmF6d2NGYzdqTzdHYXVZMDN6OHZqdlZEcEZfZVlFa0hoTTV3TzRkTkdYLTFUOHNRRmhocTlMTnZ1YlNIYmRHREdOVld0c1ZTN1p6UmxYdHFualN4WnVmZ2VhN1pLQ0ZXRDd3VEpWTm9OdnBYNE96WExYdVNxUWtlYnhfOD0zRDU1RDdCNA==`
		}
	}).then(response => {
	  if (response.status === 200) {
		return response.json();
	  } else {
		throw new Error(`Failed to create filter: ${response.status}`);
	  }
	})
	.catch(error => {
	  console.error('Error creating filer:', error);
	  throw error;
	});
}

function checkIfIssueTransitioned(issueUpdate) {
	var transitionId;
	try {
		transitionId = issueUpdate.associatedStatuses[1].name;

	} catch {
		console.log(new Error(`Transition ID not found`));
		return null;
	}
	
	if(transisitonId !== issueUpdate.associatedStatuses[2].name){
		 return transitionId;
	} else {
		return null;
	}
	
  }
	

function checkIssueType(issueId) {
  return api.asApp()
	.requestJira(route`/rest/api/3/issue/${issueId}`)
	.then(response => {
	  if (response.status === 200) {
		return response.json();
	  } else {
		throw new Error(`Failed to fetch issue: ${response.status}`);
	  }
	})
	.then(issue => {
	  const issueType = issue.fields.issuetype.name;
	  return issueType;
	})
	.catch(error => {
	  console.error('Error fetching issue type:', error);
	  throw error;
	});
}