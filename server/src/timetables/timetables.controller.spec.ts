import { Test, TestingModule } from "@nestjs/testing";
import { TimetablesController } from "./timetables.controller";

describe("TimetableController", () => {
  let controller: TimetablesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TimetablesController],
    }).compile();

    controller = module.get<TimetablesController>(TimetablesController);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });
});
