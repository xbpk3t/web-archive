import { useRequest } from 'ahooks'
import { onMessage, sendMessage } from 'webext-bridge/popup'
import { ScrollArea } from '@web-archive/shared/components/scroll-area'
import { ArrowLeft, CircleX, ClockAlert, FileCheck2, LoaderCircle, Trash } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@web-archive/shared/components/tooltip'
import Browser from 'webextension-polyfill'
import type { PageType } from '../PopupPage'
import type { SeriableSingleFileTask } from '~/background/processor'

function HistoryTaskList({ setActivePage }: { setActivePage: (tab: PageType) => void }) {
  const { data: taskList, mutate: setTaskList } = useRequest(async () => {
    const { taskList } = await sendMessage('get-page-task-list', {})
    return taskList
  })

  onMessage('update-task-list', ({ data: { taskList } }) => {
    setTaskList(taskList)
  })

  return (
    <div className="w-64 space-y-1.5 p-4">
      <div className="mb-4 flex space-x-3 justify-between">
        <ArrowLeft
          className="cursor-pointer"
          size={16}
          onClick={() => { setActivePage('home') }}
        >
        </ArrowLeft>
        <ClearHistoryTaskListButton></ClearHistoryTaskListButton>
      </div>
      <ScrollArea className="max-h-64">
        {taskList && taskList.map(task => (
          <TaskListItem key={task.uuid} task={task}></TaskListItem>
        ))}
      </ScrollArea>
    </div>
  )
}

function ClearHistoryTaskListButton() {
  function handleClick() {
    sendMessage('clear-finished-task-list', {})
  }
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Trash onClick={handleClick} className="cursor-pointer rounded-full text-destructive" size={16}></Trash>
        </TooltipTrigger>
        <TooltipContent side="left" sideOffset={20}>
          Clear finished history task list
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function TaskListItem({ task }: { task: SeriableSingleFileTask }) {
  function openOriginalPage() {
    Browser.tabs.create({
      url: task.href,
    })
  }

  return (
    <div className="flex justify-between items-center h-4">
      <div className="font-bold cursor-pointer" onClick={openOriginalPage}>{task.title}</div>
      <TaskStatusIcon status={task.status}></TaskStatusIcon>
    </div>
  )
}

function TaskStatusIcon({ status }: { status: 'init' | 'scraping' | 'uploading' | 'done' | 'failed' }) {
  if (status === 'init' || status === 'scraping' || status === 'uploading') {
    return (
      <LoaderCircle
        size={12}
        className="animate-spin"
      />
    )
  }

  if (status === 'done') {
    return (
      <FileCheck2
        size={12}
        className="text-success"
      />
    )
  }

  if (status === 'failed') {
    return (
      <ClockAlert
        size={12}
        className="text-destructive"
      />
    )
  }
  return (
    <div>
      {status}
    </div>
  )
}

export default HistoryTaskList
