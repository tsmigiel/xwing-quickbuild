namespace XWing.Json {

	export interface CardsExtensions {
		extensions: Extension[];
	}

	export interface Extension {
		id:          number;
		name:        string;
		description: string;
		cover:       string;
		url:         string;
	}

}
