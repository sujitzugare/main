const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

exports.handler = async function(event, context) {
  const repoOwner = "YOUR_GITHUB_USERNAME";
  const repoName = "YOUR_REPOSITORY_NAME";
  const filePath = "data.json";

  if (event.httpMethod === 'POST') {
    const newData = JSON.parse(event.body);
    const { data } = await octokit.repos.getContent({
      owner: repoOwner,
      repo: repoName,
      path: filePath,
    });

    const existingData = JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'));
    existingData.push(newData);

    await octokit.repos.createOrUpdateFileContents({
      owner: repoOwner,
      repo: repoName,
      path: filePath,
      message: "Update data",
      content: Buffer.from(JSON.stringify(existingData, null, 2)).toString('base64'),
      sha: data.sha,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Data saved" }),
    };
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ message: "Method not allowed" }),
  };
};
