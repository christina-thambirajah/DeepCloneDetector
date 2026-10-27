export class SourceCodeModel{
    constructor(
        public id: string,
        public name: string,
        public status:string,
        public codeBlocks: Object,
        public statistics:StatisticModel,
        public suggestions:[],
    ) { }


}

export class StatisticModel{
    constructor(
        public clonePercentage: string,
        public totalCodeBlocks: string,
        public numberOfLines: string,
        public numberOfFiles: string,
        public syntaxClones:[],
        public cloneGroups:[],
    ) { }


}
