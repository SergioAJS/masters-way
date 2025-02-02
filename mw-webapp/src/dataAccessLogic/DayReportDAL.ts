import {dayReportToDayReportDTOConverter} from "src/dataAccessLogic/BusinessToDTOConverter/dayReportToDayReportDTOConverter";
import {CurrentProblemDAL} from "src/dataAccessLogic/CurrentProblemDAL";
import {dayReportDTOToDayReportConverter} from
  "src/dataAccessLogic/DTOToBusinessConverter/dayReportDTOToDayReportConverter";
import {JobDoneDAL} from "src/dataAccessLogic/JobDoneDAL";
import {MentorCommentDAL} from "src/dataAccessLogic/MentorCommentDAL";
import {PlanForNextPeriodDAL} from "src/dataAccessLogic/PlanForNextPeriodDAL";
import {DayReport} from "src/model/businessModel/DayReport";
import {DayReportDTOWithoutUuid, DayReportService} from "src/service/DayReportService";
import {WayService} from "src/service/WayService";
import {DateUtils} from "src/utils/DateUtils";

/**
 * Provides methods to interact with the DayReport business model
 */
export class DayReportDAL {

  /**
   * Get DayReports that belong to a specific way
   */
  public static async getDayReports(wayUuid: string): Promise<DayReport[]> {
    const dayReportsUuids = (await WayService.getWayDTO(wayUuid)).dayReportUuids;

    const dayReports = await Promise.all(dayReportsUuids.map(async (dayReportUuid) => {
      const dyReport = await DayReportDAL.getDayReport(dayReportUuid);

      return dyReport;
    }));

    return dayReports;
  }

  /**
   * Get DayReport by uuid
   */
  public static async getDayReport(uuid: string): Promise<DayReport> {
    const dayReportDTO = await DayReportService.getDayReportDTO(uuid);
    const {jobDoneUuids, planForNextPeriodUuids, mentorCommentUuids, problemForCurrentPeriodUuids} = dayReportDTO;

    const jobsDone = await Promise.all(jobDoneUuids.map(async (jobDoneUuid) => {
      const jobDone = await JobDoneDAL.getJobDone(jobDoneUuid);

      return jobDone;
    }));

    const plansForNextPeriod = await Promise.all(planForNextPeriodUuids.map(async (planForNextPeriodUuid) => {
      const jobDone = await PlanForNextPeriodDAL.getPlanForNextPeriod(planForNextPeriodUuid);

      return jobDone;
    }));

    const mentorComments = await Promise.all(mentorCommentUuids.map(async (mentorCommentUuid) => {
      const jobDone = await MentorCommentDAL.getMentorComment(mentorCommentUuid);

      return jobDone;
    }));

    const problemsForCurrentPeriod =
      await Promise.all(problemForCurrentPeriodUuids.map(async (problemForCurrentPeriodUuid) => {
        const jobDone = await CurrentProblemDAL.getCurrentProblem(problemForCurrentPeriodUuid);

        return jobDone;
      }));

    const dayReportProps = {
      jobsDone,
      plansForNextPeriod,
      problemsForCurrentPeriod,
      mentorComments,
    };

    const dayReport = dayReportDTOToDayReportConverter(dayReportDTO, dayReportProps);

    return dayReport;
  }

  /**
   * Create DayReport with empty fields and autogenerated uuid
   */
  public static async createDayReport(wayUuid: string) {
    const DEFAULT_DAY_REPORT: DayReportDTOWithoutUuid = {
      date: DateUtils.getShortISODateValue(new Date),
      jobDoneUuids: [],
      planForNextPeriodUuids: [],
      problemForCurrentPeriodUuids: [],
      studentComments: [],
      learnedForToday: [],
      mentorCommentUuids: [],
      isDayOff: false,
    };
    const dayReport = await DayReportService.createDayReportDTO(DEFAULT_DAY_REPORT);

    const way = await WayService.getWayDTO(wayUuid);

    const updatedDayReportUuids = [...way.dayReportUuids, dayReport.uuid];

    await WayService.updateWayDTO(way, updatedDayReportUuids);
  }

  /**
   * Update DayReport
   */
  public static async updateDayReport(dayReport: DayReport) {
    const jobDoneUuids = dayReport.jobsDone.map((item) => item.uuid);
    const planForNextPeriodUuids = dayReport.plansForNextPeriod.map((item) => item.uuid);
    const problemForCurrentPeriodUuids = dayReport.problemsForCurrentPeriod.map((item) => item.uuid);
    const mentorCommentUuids = dayReport.mentorComments.map((item) => item.uuid);

    const dayReportDTOProps = {
      jobDoneUuids,
      planForNextPeriodUuids,
      problemForCurrentPeriodUuids,
      mentorCommentUuids,
    };

    const dayReportDTO = dayReportToDayReportDTOConverter(dayReport, dayReportDTOProps);
    await DayReportService.updateDayReportDTO(dayReportDTO, dayReport.uuid);
  }

}