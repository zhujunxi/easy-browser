import { useState, useEffect } from 'react'
import LlmService from '@services/llm/index.js'
import { useI18n } from '@hooks/useI18n'

const TaskExample = ({ onTaskClick }) => {
  const { currentLanguage } = useI18n()
  const [task, setTask] = useState([])

  // const requrestMsg = [
  //     { role: 'system', content: 'You are an AI assistant that excels at generating structured output.' },
  //     {
  //         role: 'user', content: `Please generate a JSON array containing 3 specific web operation tasks that OpenAI Operator can perform.
  //         - language：${currentLanguage}.
  //         - Keep specific tasks as short as possible.
  //         - Please strictly follow the following example format and do not output the same as the example. Return only the JSON data without adding explanations, prefixes or markdown:
  //         [
  //              'What is the latest stock price of Alphabet?',
  //              `Play MrBeast's latest videos on YouTube.`,
  //              `Which flight from London to Paris will arrive during the day tomorrow and have the lowest price?`,
  //          ]` }
  // ]
  // const options = {
  //     temperature: 0.7,
  // }
  // const fetchTasks = async () => {
  //     try {
  //         const response = await LlmService.fetch(requrestMsg, options);
  //         const tasks = JSON.parse(response.data);
  //         setTask(tasks);
  //     } catch (error) {
  //         console.error('Failed to obtain the task:', error);
  //     }
  // };
  // useEffect(() => {
  //     fetchTasks();
  // }, [])
  useEffect(() => {
    if (currentLanguage === 'English') {
      setTask([
        'What is the latest stock price of Alphabet?',
        `Play MrBeast's latest videos on YouTube.`,
        `Which flight from London to Paris will arrive during the day tomorrow and have the lowest price?`,
      ])
    } else if (currentLanguage === '中文-简体') {
      setTask([
        '今天股市的行情怎么样？',
        '播放B站红警蓝天的最新视频，并点赞',
        '明天北京飞上海的航班，白天抵达而且价格最低的是哪一班？',
      ])
    }
  }, [])
  return (
    <div className='task-example'>
      {task.map((task, index) => {
        return (
          <div className='task-example-warp' key={index}>
            <div
              className='task-example-cell animated'
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => onTaskClick(task)}
            >
              {task}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default TaskExample
