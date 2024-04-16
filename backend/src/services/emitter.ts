import { FB, IG, T } from "@/types";

import jobsService from "./jobs.service";

const emit = {
    tracker: async (data: T.TrackerData<IG.Actor | FB.Actor>, jName:string) => {
        const job = await jobsService.Queues.Tracker.add(jName, data);
        return job;
    }
}

export default emit