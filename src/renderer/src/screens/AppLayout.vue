<script setup lang="ts">
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import AppSidebar from '@/components/AppSidebar.vue'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator
} from '@/components/ui/breadcrumb'
import { useRoute } from 'vue-router'
import { computed } from 'vue'

const route = useRoute()

const breadcrumbs = {
  '/audio-file-transcribe': ['Transcribe', 'File'],
  '/audio-realtime-transcribe': ['Transcribe', 'Realtime'],
  '/audio-model-manager': ['Models', 'Audio'],
  '/text-model-manager': ['Models', 'Text'],
  '/general-settings': ['Settings', 'General']
}

const breadcrumb = computed(() => {
  return breadcrumbs[route.fullPath] ? breadcrumbs[route.fullPath] : ['', '']
})
</script>

<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header
        class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12"
      >
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
          <Separator orientation="vertical" class="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem class="hidden md:block">
                <BreadcrumbLink> {{ breadcrumb[0] }} </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator class="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{{ breadcrumb[1] }}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4 pt-0">
        <RouterView />
        <!--        <div class="grid auto-rows-min gap-4 md:grid-cols-3">-->
        <!--          <div class="aspect-video rounded-xl bg-muted/50" />-->
        <!--          <div class="aspect-video rounded-xl bg-muted/50" />-->
        <!--          <div class="aspect-video rounded-xl bg-muted/50" />-->
        <!--        </div>-->
        <!--        <div class="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />-->
      </div>
    </SidebarInset>
  </SidebarProvider>
  <!--  <Toaster />-->
</template>

<style scoped></style>
