export interface ChangeThemeRequestBody {
	theme: string;
}

export interface WeatherLocationRequestBody {
	location: {
		location: string;
		latitude: string;
		longitude: string;
	},
	unit: string;
}