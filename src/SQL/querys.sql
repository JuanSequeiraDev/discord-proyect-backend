SELECT workspace_members.id, workspace_members.workspace_id, workspace_members.user_id, workspace_members.joined_at, users.username, users.email
FROM workspace_members 
INNER JOIN users ON workspace_members.user_id = users.user_id
WHERE workspace_members.user_id = ?;
