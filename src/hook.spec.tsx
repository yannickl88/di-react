import { renderHook } from "@testing-library/react";
import { ContainerContext, useInject } from "./hook";
import { Simple, testRegistry } from "./__fixtures__/services";
import { Container } from "./container";
import React from "react";

describe("useInject", function () {
  it("should use inject things from the container context", function () {
    const { result } = renderHook(() => useInject(Simple), {
      wrapper: (props) => (
        <ContainerContext.Provider value={new Container(testRegistry)}>
          {props.children}
        </ContainerContext.Provider>
      ),
    });

    expect(result.current).toBeInstanceOf(Simple);
  });
});
