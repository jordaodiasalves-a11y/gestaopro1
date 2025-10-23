import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  bgColor: string;
}

export default function StatsCard({ title, value, icon: Icon, bgColor }: StatsCardProps) {
  return (
    <Card className="shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 ${bgColor} rounded-xl flex items-center justify-center shadow-md`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-slate-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
