#!/usr/bin/env python
# -*- coding: utf-8 -*-

from typing import Annotated

from openai import OpenAI
from pydantic import BaseModel, Field
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


class LlmOtheller:
    def __init__(self):
        self.client = OpenAI(
            # organization="Personal",
            project="proj_lO1NW7vyR49z8f5NSep1cSpk",
        )
        self.model = "gpt-4o-mini"

    def run(self, input: "InputToLlm") -> "OutFromLlm":
        out = self.client.beta.chat.completions.parse(
            model=self.model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        f"You are an othello player"
                        f" that has a personality of"
                        f" {input.personality}."
                        f" Think your next stone position"
                        f" and say some words to express your emotion"
                        f" according to your situation."
                        f"Your language must be {input.language}."
                    ),
                },
                {
                    "role": "user",
                    "content": (
                        f"Think your next stone position"
                        f" from these candidates: {input.stone_position_candicates}."
                        f" and say some words to express your emotion"
                        f" according to your situation."
                    ),
                }
            ],
            response_format=OutFromLlm,
        )
        return out.choices[0].message.parsed


class StonePosition(BaseModel):
    y: Annotated[int, Field(min=0, max=7, description="Vertical position on an othello board")]
    x: Annotated[int, Field(min=0, max=7, description="Horizontal position on an othellow board")]

class InputToLlm(BaseModel):
    current_board_state: Annotated[str, Field(title="board state")]
    stone_position_candicates: Annotated[list[StonePosition], Field(min_length=1)]
    personality: Annotated[str, Field(default="A noob othello player", description="Personality of the AI player")]
    language: Annotated[str, Field(default="ja")]

class OutFromLlm(BaseModel):
    selected_stone_position: StonePosition
    words_from_charactor: Annotated[str, Field(description="A few words as AI player's reaction for the situation")]



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://simple-othello-wattais-projects.vercel.app",
        "http://localhost",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/backend/make-llm-choice-next-position")
def make_llm_choice_next_position(input: InputToLlm) -> OutFromLlm:
    llm = LlmOtheller()
    return llm.run(input=InputToLlm(
        current_board_state=input.current_board_state,
        stone_position_candicates=input.stone_position_candicates,
        personality=input.personality,
        language=input.language,
    ))


if __name__ == "__main__":
    # import uvicorn
    # uvicorn.run(app, host="0.0.0.0", port=8000, log_level="debug")
    out = make_llm_choice_next_position(
        InputToLlm(
            current_board_state="",
            stone_position_candicates=[
                StonePosition(y=0, x=3),
                StonePosition(y=4, x=2),
                StonePosition(y=6, x=7),
            ],
            personality="ずんだもん 語尾が「のだ」",
            language="ja",
        )
    )
    print(out)
