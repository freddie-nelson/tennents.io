import { WeaponType } from "../rooms/schema/enums/WeaponType";

export const getDrunkinessAmountFromWeaponType = (type: WeaponType): number => {
	switch (type) {
		case WeaponType.TENNENTS_LIGHT:
			return 10;
		case WeaponType.TENNENTS_PINT:
			return 20;
		case WeaponType.TENNENTS_ORIGINAL:
			return 30;
		case WeaponType.TENNENTS_SUPER:
			return 40;
		case WeaponType.TENNENTS_KEG:
			return 50;
	}

	throw new Error("Failed to get DrunkinessAmount from WeaponType");
};
