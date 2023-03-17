import { jest } from "@jest/globals";
import voucherRepository from "../src/repositories/voucherRepository";
import voucherService from "../src/services/voucherService"

describe("Creation of voucher", () => {
  const voucherData = {
    code: '1NSJ192JD0S91JDA',
    discount: 25
  }

  it("create voucher with given info", async () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => { return null });

    jest
      .spyOn(voucherRepository, "createVoucher")
      .mockImplementationOnce((): any => { });

    await voucherService.createVoucher(voucherData.code, voucherData.discount);
    expect(voucherRepository.createVoucher).toBeCalledWith(voucherData.code, voucherData.discount);
  });

  it("throw conflictError at code already used", async () => {
    jest
      .spyOn(voucherRepository, "getVoucherByCode")
      .mockImplementationOnce((): any => {
        return {
          id: 1,
          code: voucherData.code,
          discount: voucherData.discount,
          used: false
        }
      });

    expect(voucherService.createVoucher(voucherData.code, voucherData.discount)).rejects.toEqual({ type: "conflict", message: "Voucher already exist." });
  })
});

