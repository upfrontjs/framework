import { SidebarConfig } from "vuepress";
import { NavbarConfig } from "@vuepress/theme-default/lib/shared/nav";

const sidebar: SidebarConfig = [
    {
        text: 'Prologue',
        collapsible: true,
        children: [
            '/prologue/contributing',
            '/prologue/project-policies'
        ]
    },
    {
        text: 'Getting Started',
        collapsible: true,
        children: [
            '/getting-started/',
            '/getting-started/installation'
        ]
    },
    {
        text: 'Calliope',
        collapsible: true,
        children: [
            '/calliope/',
            '/calliope/attributes',
            '/calliope/api-calls',
            '/calliope/query-building',
            '/calliope/relationships',
            '/calliope/timestamps',
            '/calliope/model-collection',
            '/calliope/ancestry-collection'
        ]
    },
    {
        text: 'Services',
        collapsible: true,
        children: [
            '/services/',
            '/services/api',
            '/services/api-response-handler'
        ]
    },
    {
        text: 'Helpers',
        collapsible: true,
        children: [
            '/helpers/',
            '/helpers/collection',
            '/helpers/pagination',
            '/helpers/global-config',
            '/helpers/event-emitter'
        ]
    },
    {
        text: 'Testing',
        collapsible: true,
        children: [
            '/testing/',
            '/testing/factories'
        ]
    },
    {
        text: 'Cookbook',
        link: '/cookbook'
    },
]

const navbar: NavbarConfig = [
    { text: 'API', link: 'https://upfrontjs.github.io/framework', target:'_blank' }
]

export default {
    sidebar,
    navbar
}
