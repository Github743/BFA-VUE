import { get } from "@/modules/shared/api/http";
const DocumentService = {
    getNotes: async (workOrderId) => {
        return await get("/notesDocument", { workOrderId });
    }
}
export default DocumentService;