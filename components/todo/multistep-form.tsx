"use client";

import React, { useState, useMemo } from "react";
import { format } from "date-fns";
import { Check, ChevronRight, ChevronLeft, CalendarIcon } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import useMeasure from "react-use-measure";

const MultiStepForm = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<{
    projectName: string;
    dueDate: Date | undefined;
    description: string;
    teamSize: string;
    priority: string;
    tags: string;
    mood: string;
    comment: string;
  }>({
    projectName: "",
    dueDate: undefined,
    description: "",
    teamSize: "",
    priority: "",
    tags: "",
    mood: "",
    comment: "",
  });

  const [ref, bounds] = useMeasure();

  const nextStep = () => {
    if (currentStep < 2) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1);
  };

  const stepTitles = [
    {
      title: "Create New Project",
      description:
        "Start by providing the essential details for your workspace.",
    },
    {
      title: "Configuration",
      description: "Define team access and project priority settings.",
    },
    {
      title: "Project Kickoff Mood",
      description: "How confident do you feel about this new project?",
    },
  ];

  const content = useMemo(() => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name</Label>
              <Input
                id="projectName"
                name="projectName"
                placeholder="e.g. Website Redesign"
                value={formData.projectName}
                onChange={(e) =>
                  setFormData({ ...formData, projectName: e.target.value })
                }
              />
            </div>
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="dueDate">Due Date</Label>
              <Popover>
                <PopoverTrigger
                  className={cn(
                    buttonVariants({ variant: "outline" }),
                    "w-full justify-start text-left font-normal",
                    !formData.dueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.dueDate ? (
                    format(formData.dueDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) =>
                      setFormData({ ...formData, dueDate: date })
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the project goals and scope..."
                className="resize-none min-h-[100px]"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Team Size</Label>
                <Select value={formData.teamSize}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-5">1-5 Members</SelectItem>
                    <SelectItem value="5-10">5-10 Members</SelectItem>
                    <SelectItem value="10+">10+ Members</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={formData.priority}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="relative">
                <Input
                  id="tags"
                  name="tags"
                  placeholder="e.g. Design, Marketing"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="py-4">
            <div className="rounded-xl border bg-background overflow-hidden relative">
              <div className="flex w-full border-b divide-x bg-muted/5">
                {[
                  { emoji: "😰", value: "anxious", label: "Anxious" },
                  { emoji: "😟", value: "worried", label: "Worried" },
                  { emoji: "😐", value: "neutral", label: "Neutral" },
                  { emoji: "🙂", value: "good", label: "Good" },
                  { emoji: "🤩", value: "excited", label: "Excited" },
                ].map((option) => (
                  <button
                    key={option.value}
                    className={cn(
                      "flex-1 p-3 md:p-4 text-2xl md:text-3xl transition-all hover:bg-muted focus:outline-none",
                      formData.mood === option.value
                        ? "bg-primary/10 grayscale-0"
                        : "grayscale-[1] hover:grayscale-0"
                    )}
                    type="button"
                    title={option.label}
                  >
                    {option.emoji}
                  </button>
                ))}
              </div>
              <Textarea
                id="comment"
                name="comment"
                placeholder="Add a comment..."
                value={formData.comment}
                className="min-h-[140px] resize-none border-0 focus-visible:ring-0 rounded-none bg-transparent p-4 placeholder:text-muted-foreground/60"
                onChange={(e) =>
                  setFormData({ ...formData, comment: e.target.value })
                }
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  }, [currentStep]);

  return (
    <motion.div
      animate={{ height: bounds.height }}
      className="flex  w-full items-center justify-center bg-muted/10"
    >
      <Card className="w-full max-w-xl shadow-none border ">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 px-6 py-2">
          <div className="flex flex-col gap-1">
            <CardTitle className="text-xl">
              {stepTitles[currentStep].title}
            </CardTitle>
            <CardDescription>
              {stepTitles[currentStep].description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            {stepTitles.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  currentStep === index ? "w-8 bg-primary" : "w-2 bg-primary/20"
                )}
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="px-6 py-2 overflow-hidden relative" ref={ref}>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={currentStep}
              initial={{ x: "110%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-110%", opacity: 0 }}
              transition={{ duration: 0.4, type: "spring", bounce: 0 }}
              className="overflow-hidden"
            >
              {content}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <motion.div layout>
          <CardFooter className="flex justify-between border-t ">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="text-muted-foreground hover:text-foreground  hover:bg-transparent"
            >
              <ChevronLeft />
              Back
            </Button>
            <Button
              onClick={nextStep}
              className="bg-primary text-primary-foreground flex items-center justify-center"
            >
              {currentStep === stepTitles.length - 1 ? (
                <>
                  Finish <Check />
                </>
              ) : (
                <>
                  Continue <ChevronRight />
                </>
              )}
            </Button>
          </CardFooter>
        </motion.div>
      </Card>
    </motion.div>
  );
};

export default MultiStepForm;
