import { HealingType } from "../rooms/schema/enums/HealingType";

export const getHealingAmountFromHealingType = (type: HealingType): number => {
	switch (type) {
		case HealingType.TENNENTS_ZERO:
			return 10;
		case HealingType.WATER:
			return 20;
		case HealingType.COFFEE:
			return 30;
		case HealingType.ORANGE_JUICE:
			return 50;
		case HealingType.DONER_KEBAB:
			return 100;
	}

	throw new Error("Failed to get HealingAmount from HealingType");
};
