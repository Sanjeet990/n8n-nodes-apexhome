export interface PageRequestBody {
	pageTitle: string;
	pageContent: string;
	isPublished: boolean;
}

export interface PagePublishRequestBody {
	isPublished: boolean;
}