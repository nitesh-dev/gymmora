import { planRepository } from '../repositories/plan.repository';

export class PlanService {
    async getAllPlans() {
        return await planRepository.findPublicPlans();
    }

    async getPlanDetails(id: string) {
        return await planRepository.getFullPlanStructure(id);
    }

    async createPlan(data: any) {
        const { structure, ...planData } = data;
        return await planRepository.createFullPlan(planData, structure);
    }

    async updatePlan(id: string, data: any) {
        const { structure, ...planData } = data;
        if (planData) {
            await planRepository.update(id, planData);
        }
        if (structure) {
            await planRepository.updateStructure(id, structure);
        }
        return await planRepository.getFullPlanStructure(id);
    }

    async deletePlan(id: string) {
        return await planRepository.delete(id);
    }
}

export const planService = new PlanService();
