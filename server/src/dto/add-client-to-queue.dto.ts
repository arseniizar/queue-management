import { IsNotEmpty } from "class-validator";

interface Appointment {
  place: string;
  time: Date;
}

export class AddClientToQueueDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  queueId: string;

  @IsNotEmpty()
  appointment: Appointment | null;
}
