import { IsNotEmpty } from "class-validator";

export interface ClientAppointment {
  place: string;
  time: string;
}

export class AddClientToQueueDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  queueId: string;

  @IsNotEmpty()
  appointment: ClientAppointment | null;
}
