interface ImprovementTask {
    id: string;
    title: string;
    description: string;
    impact: number;
    category: 'academic' | 'experience' | 'tests' | 'documents';
    actionable: string;
}
/**
 * Generate personalized improvement tasks based on user profile
 */
export declare function generateImprovementTasks(userProfile: any): Promise<ImprovementTask[]>;
declare const _default: {
    generateImprovementTasks: typeof generateImprovementTasks;
};
export default _default;
//# sourceMappingURL=llm.service.d.ts.map