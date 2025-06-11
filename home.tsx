import AppHeader from "@/components/app-header";
import InputSection from "@/components/input-section";
import AIResponseSection from "@/components/ai-response-section";
import TaskHistorySection from "@/components/task-history-section";
import Sidebar from "@/components/sidebar";
import VoiceRecordingModal from "@/components/voice-recording-modal";
import NotificationToast from "@/components/notification-toast";
import { useTasks } from "@/hooks/use-tasks";
import { useNotifications } from "@/hooks/use-notifications";
import { useState } from "react";

export default function Home() {
  const { tasks, todaysTasks, stats, createTask, updateTask, searchTasks } = useTasks();
  const { notifications, addNotification, dismissNotification } = useNotifications();
  const [currentAIResponse, setCurrentAIResponse] = useState<string>("");
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  const handleTaskSubmit = async (taskData: any) => {
    try {
      const newTask = await createTask(taskData);
      
      // Get AI response
      const response = await fetch("/api/tasks/ai-assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: taskData.description,
          category: taskData.category,
          priority: taskData.priority
        }),
      });
      
      const { response: aiResponse } = await response.json();
      setCurrentAIResponse(aiResponse);
      
      // Update task with AI response
      await updateTask(newTask.id, { aiResponse });
      
      addNotification({
        title: "AI Assistance Ready",
        message: "Your home task solution is ready!",
        type: "success"
      });
    } catch (error) {
      addNotification({
        title: "Error",
        message: "Failed to get AI assistance. Please try again.",
        type: "error"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <InputSection 
              onTaskSubmit={handleTaskSubmit}
              onVoiceStart={() => setIsVoiceModalOpen(true)}
            />
            
            {currentAIResponse && (
              <AIResponseSection 
                response={currentAIResponse}
                onSave={() => addNotification({
                  title: "Task Saved",
                  message: "Task has been saved to your history.",
                  type: "success"
                })}
                onSetReminder={() => addNotification({
                  title: "Reminder Set",
                  message: "You'll be notified when it's time to start this task.",
                  type: "info"
                })}
                onEmailInstructions={() => addNotification({
                  title: "Email Sent",
                  message: "Instructions have been sent to your email.",
                  type: "success"
                })}
              />
            )}
            
            <TaskHistorySection 
              tasks={tasks}
              onSearch={searchTasks}
            />
          </div>
          
          <Sidebar 
            todaysTasks={todaysTasks}
            stats={stats}
            onTaskComplete={(taskId) => {
              updateTask(taskId, { status: "completed" });
              addNotification({
                title: "Task Completed!",
                message: "Great job on completing your task.",
                type: "success"
              });
            }}
          />
        </div>
      </div>

      <VoiceRecordingModal 
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscript={(transcript) => {
          // Handle voice transcript
          console.log("Voice transcript:", transcript);
        }}
      />

      {notifications.map((notification) => (
        <NotificationToast
          key={notification.id}
          notification={notification}
          onDismiss={() => dismissNotification(notification.id)}
        />
      ))}
    </div>
  );
}
