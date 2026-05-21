'use client';

import type { ReactNode } from 'react';
import { AtlasSprite } from '@/shared/ui/AtlasSprite';

type HeaderGoldBadgeVariant = 'compact' | 'labeled';

interface HeaderGoldBadgeProps {
  /** 표시할 골드 수량입니다. */
  gold: number;
  /** 창 성격에 맞춘 골드 배지 스타일입니다. */
  variant?: HeaderGoldBadgeVariant;
  /** labeled 배지에서 수량 옆에 표시할 텍스트입니다. */
  label?: string;
  /** labeled 배지의 라벨 색상 클래스입니다. */
  labelClassName?: string;
}

interface WindowHeaderProps {
  /** 제목 왼쪽에 표시할 아이콘 또는 아이콘 컨테이너입니다. */
  icon: ReactNode;
  /** 창 제목입니다. */
  title: string;
  /** 제목 아래에 표시할 보조 설명입니다. */
  subtitle?: string;
  /** 제목 색상 클래스입니다. */
  titleClassName: string;
  /** 부제목에 추가할 색상 및 상태 클래스입니다. */
  subtitleClassName?: string;
  /** 제목 영역 옆에 배치할 탭 또는 추가 컨트롤입니다. */
  children?: ReactNode;
  /** 표시할 골드 수량입니다. 값이 없으면 골드 배지를 표시하지 않습니다. */
  gold?: number;
  /** 닫기 버튼 클릭 콜백입니다. */
  onClose: () => void;
  /** 헤더 컨테이너에 추가할 클래스입니다. */
  headerClassName?: string;
  /** 헤더 배경, 테두리, 블러 등 표면 스타일 클래스입니다. */
  headerChromeClassName?: string;
  /** 아이콘과 제목 묶음에 추가할 클래스입니다. */
  titleClusterClassName?: string;
  /** 헤더 내부의 은은한 광택 레이어를 표시할지 여부입니다. */
  showSheen?: boolean;
  /** 닫기 버튼에 추가할 상태 클래스입니다. */
  closeButtonClassName: string;
  /** 닫기 버튼 비활성화 여부입니다. */
  closeDisabled?: boolean;
  /** 골드 배지 스타일입니다. */
  goldVariant?: HeaderGoldBadgeVariant;
  /** 골드 라벨 색상 클래스입니다. */
  goldLabelClassName?: string;
}

/**
 * 게임 내 전체 화면 창들이 공유하는 골드 표시 배지입니다.
 */
export function HeaderGoldBadge({
  gold,
  variant = 'compact',
  label,
  labelClassName = '',
}: HeaderGoldBadgeProps) {
  if (variant === 'labeled') {
    return (
      <div className="pixel-badge pixel-font flex items-center justify-center gap-3 md:gap-4 px-4 py-2 md:px-6 md:py-3 group">
        <div className="flex items-center justify-center">
          <AtlasSprite name="GoldIcon" size={32} />
        </div>
        <span className="text-sm md:text-2xl font-black text-[#f8e3a5] tabular-nums flex items-baseline gap-2">
          {gold.toLocaleString()}
          {label && (
            <span
              className={['text-[10px] md:text-xs font-black opacity-70', labelClassName]
                .filter(Boolean)
                .join(' ')}
            >
              {label}
            </span>
          )}
        </span>
      </div>
    );
  }

  return (
    <div className="pixel-badge pixel-font flex items-center justify-center gap-2 md:gap-4 px-4 py-2 md:px-6 md:py-3">
      <div className="flex items-center justify-center">
        <AtlasSprite name="GoldIcon" size={32} />
      </div>
      <span className="text-sm md:text-xl font-black text-[#f8e3a5] tabular-nums">
        {gold.toLocaleString()}
      </span>
    </div>
  );
}

/**
 * 게임 내 전체 화면 창들이 공유하는 상단 헤더입니다.
 */
export function WindowHeader({
  icon,
  title,
  subtitle,
  titleClassName,
  subtitleClassName = 'text-[#a89065]',
  children,
  gold,
  onClose,
  headerClassName = '',
  headerChromeClassName = '',
  titleClusterClassName = 'flex items-center gap-3',
  showSheen = false,
  closeButtonClassName,
  closeDisabled = false,
  goldVariant = 'compact',
  goldLabelClassName = '',
}: WindowHeaderProps) {
  const hasGold = typeof gold === 'number';

  return (
    <div
      className={[
        'pixel-panel pixel-font relative flex flex-col md:flex-row justify-between items-center mb-6 md:mb-10 px-4 py-4 md:px-8 md:py-5 shrink-0 gap-4 md:gap-6',
        headerChromeClassName,
        headerClassName,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {showSheen && <div className="absolute inset-0 bg-[#d4a35f]/5 pointer-events-none" />}

      <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-8 w-full md:w-auto relative z-10">
        <div className={titleClusterClassName}>
          {icon}
          <div className="flex flex-col">
            <h2
              className={[
                'text-2xl md:text-3xl font-black leading-none drop-shadow-[2px_2px_0_rgba(0,0,0,0.75)]',
                titleClassName,
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {title}
            </h2>
            {subtitle && (
              <span
                className={['text-[10px] font-bold mt-1', subtitleClassName]
                  .filter(Boolean)
                  .join(' ')}
              >
                {subtitle}
              </span>
            )}
          </div>
        </div>

        {children}
      </div>

      <div
        className={[
          'flex items-center gap-3 md:gap-6 w-full md:w-auto relative z-10',
          hasGold ? 'justify-between md:justify-end' : 'justify-end',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {hasGold && (
          <HeaderGoldBadge
            gold={gold}
            variant={goldVariant}
            label={goldVariant === 'labeled' ? 'Gold' : undefined}
            labelClassName={goldLabelClassName}
          />
        )}
        <button
          onClick={onClose}
          disabled={closeDisabled}
          aria-label="Close window"
          className={[
            'pixel-button w-10 h-10 md:w-12 md:h-12 shrink-0 flex items-center justify-center text-[#d8c2a6] transition-colors active:translate-y-px focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed',
            closeButtonClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <span className="text-lg md:text-xl font-bold">✕</span>
        </button>
      </div>
    </div>
  );
}
