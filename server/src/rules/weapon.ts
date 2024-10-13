import { WeaponType } from "../rooms/schema/enums/WeaponType";

export const getDrunkinessAmountFromWeaponType = (type: WeaponType): number => {
	switch (type) {
		case WeaponType.TENNENTS_LIGHT:
			return 5;
		case WeaponType.TENNENTS_PINT:
			return 8;
		case WeaponType.TENNENTS_ORIGINAL:
			return 12;
		case WeaponType.TENNENTS_SUPER:
			return 18;
		case WeaponType.TENNENTS_KEG:
			return 25;
	}

	throw new Error("Failed to get DrunkinessAmount from WeaponType");
};
