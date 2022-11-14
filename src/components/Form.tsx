import { Group, Header, FormItem, SegmentedControl, Button, Input } from "@vkontakte/vkui";
import { useState } from "react";
import { InputsData } from "../contracts/types";

const segmentOptions = [
  {
    label: "Buyer",
    value: "buyer",
  },
  {
    label: "Seller",
    value: "seller",
  },
  {
    label: "Guarantor",
    value: "guarantor",
  },
];

type Props = {
  loading: boolean;
  onSubmit: (inputs: InputsData) => void;
};

export function Form({ onSubmit, loading }: Props) {
  const [option, setOption] = useState(segmentOptions[0].value);
  const [inputs, setInputs] = useState({ buyer: "", seller: "", guarantor: "", orderId: "" });

  const handleChangeInput = (text: string, name: string) => {
    setInputs((prev) => ({ ...prev, [`${name}`]: text }));
  };

  const handleSubmit = () => onSubmit({ ...inputs, role: option });

  return (
    <Group header={<Header>Escrow panel</Header>}>
      <FormItem top="Choose a role">
        <SegmentedControl
          size="l"
          name="role"
          value={option}
          onChange={(value) => setOption(value as string)}
          options={segmentOptions}
        />

        {segmentOptions.map(
          ({ value, label }) =>
            option !== value && (
              <FormItem key={value} top={`${label} address`}>
                <Input
                  // @ts-ignore
                  value={inputs[value]}
                  onChange={(e) => handleChangeInput(e.target.value, value)}
                  placeholder="EQ..."
                />
              </FormItem>
            )
        )}

        <FormItem top="Order id">
          <Input
            type="number"
            placeholder="Enter order id"
            value={inputs.orderId}
            onChange={(e) => handleChangeInput(e.target.value, "orderId")}
          />
        </FormItem>

        <FormItem>
          <Button loading={loading} onClick={handleSubmit} size="l" stretched>
            {option !== "buyer" ? "Search" : "Search or create"}
          </Button>
        </FormItem>
      </FormItem>
    </Group>
  );
}
