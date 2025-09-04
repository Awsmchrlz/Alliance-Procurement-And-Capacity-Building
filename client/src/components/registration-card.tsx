
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, AlertTriangle } from "lucide-react";

// Define the types based on your schema
interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
}

interface Registration {
  id: string;
  status: 'confirmed' | 'cancelled' | 'pending';
  events: Event;
}

interface RegistrationCardProps {
  registration: Registration;
  onCancel: (id: string) => void;
}

export function RegistrationCard({ registration, onCancel }: RegistrationCardProps) {
  const { status, events: event } = registration;
  const isPast = new Date(event.date) < new Date();
  const isCancelled = status === 'cancelled';

  const getStatusBadge = () => {
    if (isCancelled) {
      return <Badge variant="destructive">Cancelled</Badge>;
    }
    if (isPast) {
      return <Badge variant="secondary">Completed</Badge>;
    }
    return <Badge className="bg-green-500 text-white">Confirmed</Badge>;
  };

  return (
    <Card className={`transition-all duration-300 ${isCancelled ? 'bg-gray-100 dark:bg-gray-800/50 opacity-70' : 'bg-white dark:bg-gray-800'}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold text-primary-blue dark:text-white">{event.title}</CardTitle>
          {getStatusBadge()}
        </div>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 pt-2">
          <Calendar className="w-4 h-4 mr-2" />
          <span>{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 dark:text-gray-300 mb-4">{event.description}</p>
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
          <MapPin className="w-4 h-4 mr-2" />
          <span>{event.location}</span>
        </div>
      </CardContent>
      {!isPast && !isCancelled && (
        <CardFooter className="flex justify-end">
          <Button variant="destructive" size="sm" onClick={() => onCancel(registration.id)}>
            <AlertTriangle className="w-4 h-4 mr-2" />
            Cancel Registration
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
