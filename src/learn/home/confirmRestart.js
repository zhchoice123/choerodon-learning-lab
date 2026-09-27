// 「已有作业」时的三选一确认框：继续 / 重新开始 / 取消。
// 通过 ✕、遮罩或 Esc 关闭时视为取消。
import React from 'react';
import { Button, Modal } from 'choerodon-ui/pro';
import { DIFFICULTY_LABELS } from '../constants';

export default function confirmRestart({ unit, difficulty }) {
  return new Promise((resolve) => {
    let settled = false;
    let modal;
    const choose = (choice) => {
      if (!settled) {
        settled = true;
        resolve(choice);
      }
      if (modal) modal.close();
    };
    const label = DIFFICULTY_LABELS[difficulty];

    modal = Modal.open({
      key: 'learn-home-confirm-restart',
      title: `「${unit.title}」里已有你的代码`,
      closable: true,
      children: (
        <div className="learn-home-confirm">
          <p>你可以继续上次写到一半的代码，也可以用「{label}」难度的模板重新开始。</p>
          <p>重新开始前，原来的代码会自动备份到项目的 .backup/ 目录，不会丢失。</p>
        </div>
      ),
      footer: (
        <div className="learn-home-confirm-footer">
          <Button onClick={() => choose('cancel')}>取消</Button>
          <Button onClick={() => choose('restart')}>以「{label}」难度重新开始</Button>
          <Button color="primary" onClick={() => choose('continue')}>
            继续上次的代码
          </Button>
        </div>
      ),
      afterClose: () => choose('cancel'),
    });
  });
}
