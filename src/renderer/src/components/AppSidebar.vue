<script setup lang="ts">
import type { SidebarProps } from '@/components/ui/sidebar'

import {
  AudioWaveform,
  Bot,
  Frame,
  Map,
  PieChart,
  Settings2,
  SquareTerminal
} from 'lucide-vue-next'
import NavMain from '@/components/NavMain.vue'
import NavUser from '@/components/NavUser.vue'
import TeamSwitcher from '@/components/TeamSwitcher.vue'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail
} from '@/components/ui/sidebar'

const props = withDefaults(defineProps<SidebarProps>(), {
  collapsible: 'icon'
})

// This is sample data.
const data = {
  user: {
    name: 'gabbar',
    email: 'm@bizenlabs.com',
    avatar: '/avatars/shadcn.jpg'
  },
  teams: [
    {
      name: 'Bizen Labs',
      logo: AudioWaveform,
      plan: 'Enterprise'
    }
  ],
  navMain: [
    {
      title: 'Transcribe',
      url: '#',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'File',
          url: 'audio-file-transcribe'
        },
        {
          title: 'Realtime',
          url: 'audio-realtime-transcribe'
        }
      ]
    },
    {
      title: 'Models',
      url: '#',
      icon: Bot,
      items: [
        {
          title: 'Audio',
          url: 'audio-model-manager'
        },
        {
          title: 'Text',
          url: 'text-model-manager'
        }
        // {
        //   title: 'Explorer',
        //   url: '#'
        // },
        // {
        //   title: 'Quantum',
        //   url: '#'
        // }
      ]
    },
    // {
    //   title: 'Documentation',
    //   url: '#',
    //   icon: BookOpen,
    //   items: [
    //     {
    //       title: 'Introduction',
    //       url: '#'
    //     },
    //     {
    //       title: 'Get Started',
    //       url: '#'
    //     },
    //     {
    //       title: 'Tutorials',
    //       url: '#'
    //     },
    //     {
    //       title: 'Changelog',
    //       url: '#'
    //     }
    //   ]
    // },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'General',
          url: 'general-settings'
        }
        // {
        //   title: 'Team',
        //   url: '#'
        // },
        // {
        //   title: 'Billing',
        //   url: '#'
        // },
        // {
        //   title: 'Limits',
        //   url: '#'
        // }
      ]
    }
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: Frame
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: PieChart
    },
    {
      name: 'Travel',
      url: '#',
      icon: Map
    }
  ]
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <!--      <div-->
      <!--        class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"-->
      <!--      >-->
      <!--        <AudioWaveform class="size-4"></AudioWaveform>-->
      <!--        &lt;!&ndash;        <component :is="activeTeam.logo" class="size-4" />&ndash;&gt;-->
      <!--      </div>-->
      <!--      <div class="grid flex-1 text-left text-sm leading-tight">-->
      <!--        <span class="truncate font-medium"> Bizen Labs </span>-->
      <!--        <span class="truncate text-xs">Local Transcribe</span>-->
      <!--      </div>-->
      <TeamSwitcher :teams="data.teams" />
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
      <!--      <NavProjects :projects="data.projects" />-->
    </SidebarContent>
    <SidebarFooter>
      <NavUser :user="data.user" />
    </SidebarFooter>
    <SidebarRail />
  </Sidebar>
</template>
