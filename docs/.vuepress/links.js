const sidebar = [
    {
        title: 'Prologue',
        children: [
            '/prologue/contributing',
            '/prologue/project-policies'
        ]
    },
    {
        title: 'Getting Started',
        path: '/getting-started/',
        children: [
            '/getting-started/installation'
        ]
    },
    {
        title: 'Calliope',
        path: '/calliope/',
        children: [
            '/calliope/attributes',
            '/calliope/api-calls',
            '/calliope/query-building',
            '/calliope/relationships',
            '/calliope/timestamps',
            '/calliope/model-collection'
        ]
    },
    {
        title: 'Services',
        path: '/services/',
        children: [
            '/services/api',
            '/services/api-response-handler'
        ]
    },
    {
        title: 'Helpers',
        path: '/helpers/',
        children: [
            '/helpers/collection',
            '/helpers/pagination',
            '/helpers/global-config',
            '/helpers/event-emitter'
        ]
    },
    {
        title: 'Cookbook',
        children: [
            '/cookbook'
        ]
    },
    {
        title: 'Testing',
        children: [
            '/testing'
        ]
    },
]

module.exports = {
    sidebar,
    nav: [
        { text: 'API', link: 'https://upfrontjs.github.io/framework', target:'_blank' }
    ]
}
