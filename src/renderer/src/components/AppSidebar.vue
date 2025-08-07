<script setup lang="ts">
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProps
} from '@/components/ui/sidebar'

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
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <a href="#">
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
              >
                <AudioWaveform color="hsl(150 100% 50%)" class="size-4" />
              </div>

              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-medium">Bizen Labs</span>
                <span class="truncate text-xs">Local first</span>
              </div>

              <!--              <div class="flex flex-col gap-0.5 leading-none">-->
              <!--                <span class="font-semibold">Documentation</span>-->
              <!--                <span class="">v1.0.0</span>-->
              <!--              </div>-->
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
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
