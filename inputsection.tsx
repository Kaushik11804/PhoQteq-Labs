import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bot, Keyboard, Mic, Camera, Send } from "lucide-react";

interface InputSectionProps {
  onTaskSubmit: (taskData: any) => void;
  onVoiceStart: () => void;
}

export default function InputSection({ onTaskSubmit, onVoiceStart }: InputSectionProps) {
  const [inputText, setInputText] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("text");

  const handleSubmit = async () => {
    if (!inputText.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await onTaskSubmit({
        title: extractTitle(inputText),
        description: inputText,
        category: category || "general",
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: "pending"
      });
      
      // Reset form
      setInputText("");
      setCategory("");
      setPriority("medium");
      setDueDate("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        // Handle image upload
        setInputText(`Uploaded image: ${file.name}. Please analyze this image and provide home maintenance guidance.`);
      }
    };
    input.click();
  };

  const extractTitle = (text: string): string => {
    const firstSentence = text.split('.')[0];
    return firstSentence.length > 50 ? firstSentence.substring(0, 50) + "..." : firstSentence;
  };

  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Bot className="text-purple-600" />
          <span>Ask HomeHelper AI</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="text" className="flex items-center space-x-1">
              <Keyboard className="h-4 w-4" />
              <span>Text</span>
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center space-x-1">
              <Mic className="h-4 w-4" />
              <span>Voice</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="flex items-center space-x-1">
              <Camera className="h-4 w-4" />
              <span>Image</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="text" className="space-y-4">
            <div className="relative">
              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe your home task or problem... (e.g., 'My kitchen faucet is leaking' or 'How do I fix a squeaky door?')"
                rows={4}
                className="resize-none"
              />
              <div className="absolute bottom-3 right-3">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plumbing">🔧 Plumbing</SelectItem>
                    <SelectItem value="carpentry">🪚 Carpentry</SelectItem>
                    <SelectItem value="electrical">⚡ Electrical</SelectItem>
                    <SelectItem value="painting">🎨 Painting</SelectItem>
                    <SelectItem value="cleaning">🧽 Cleaning</SelectItem>
                    <SelectItem value="gardening">🌱 Gardening</SelectItem>
                    <SelectItem value="general">🏠 General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="voice" className="space-y-4">
            <div className="text-center py-8">
              <Button onClick={onVoiceStart} className="mb-4">
                <Mic className="h-4 w-4 mr-2" />
                Start Voice Recording
              </Button>
              <p className="text-sm text-gray-600">Click to record your voice and describe your home task</p>
            </div>
          </TabsContent>
          
          <TabsContent value="image" className="space-y-4">
            <div className="text-center py-8">
              <Button onClick={handleImageUpload} className="mb-4">
                <Camera className="h-4 w-4 mr-2" />
                Upload Image
              </Button>
              <p className="text-sm text-gray-600">Upload an image of your home issue for AI analysis</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium">Priority:</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">🟢 Low</SelectItem>
                <SelectItem value="medium">🟡 Medium</SelectItem>
                <SelectItem value="high">🔴 High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <Label className="text-sm font-medium">Due Date:</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-40"
            />
          </div>
        </div>

        <Button 
          onClick={handleSubmit} 
          className="w-full bg-blue-600 hover:bg-blue-700"
          disabled={!inputText.trim() || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Get AI Assistance
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
