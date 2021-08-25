/** @type {import('@types/semantic-release').GlobalConfig} */
module.exports = {
    branches: [
        'release\\/([0-9])\\.x',
        'main'
    ],
    plugins: [
        "@semantic-release/commit-analyzer",
        ["@semantic-release/release-notes-generator", {
            preset: 'conventionalcommits'
        }],
        "@semantic-release/npm",
        "@semantic-release/git",
        "@semantic-release/github"
    ]
};
