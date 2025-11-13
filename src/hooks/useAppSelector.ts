import { useSelector } from "react-redux";
import type { RootState } from "../store/store";

export const useAppSelector = <T extends (state: RootState) => any>(
  selector: T
) => {
  return useSelector(selector);
};
