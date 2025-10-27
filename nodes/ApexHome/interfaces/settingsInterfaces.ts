export interface ChangeThemeRequestBody {
	theme: string;
}

export interface WeatherLocationRequestBody {
	location: {
		locationName: string;
		latitude: string;
		longitude: string;
	},
	unit: string;
}