import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

export interface ZoneInfo {
    zoneId: number;
    zoneName: string;
    currentPlayers: number;
    maxCapacity: number;
}

@ccclass('ZoneManager')
export class ZoneManager extends Component {
    private static _instance: ZoneManager | null = null;
    public static get instance(): ZoneManager {
        return this._instance!;
    }

    @property
    public totalZones: number = 10;

    @property
    public maxCapacityPerZone: number = 20;

    public currentZoneId: number = 1;
    public zones: ZoneInfo[] = [];

    protected onLoad() {
        if (ZoneManager._instance && ZoneManager._instance !== this) {
            this.destroy();
            return;
        }
        ZoneManager._instance = this;

        this.initZones();
    }

    private initZones() {
        this.zones = [];
        for (let i = 1; i <= this.totalZones; i++) {
            this.zones.push({
                zoneId: i,
                zoneName: `Khu ${i}`,
                currentPlayers: (i === 1) ? 1 : Math.floor(Math.random() * 12) + 2,
                maxCapacity: this.maxCapacityPerZone
            });
        }
    }

    public get currentZone(): ZoneInfo {
        return this.zones.find(z => z.zoneId === this.currentZoneId) || this.zones[0];
    }

    public requestChangeZone(targetZoneId: number): boolean {
        const target = this.zones.find(z => z.zoneId === targetZoneId);
        if (!target) return false;

        if (target.currentPlayers >= target.maxCapacity) {
            console.warn(`[ZoneManager] ${target.zoneName} đã đầy (20/20 người)!`);
            return false;
        }

        const prev = this.currentZone;
        if (prev && prev.currentPlayers > 0) prev.currentPlayers--;

        this.currentZoneId = targetZoneId;
        target.currentPlayers++;

        console.log(`[ZoneManager] Chuyển khu thành công sang: ${target.zoneName}`);
        return true;
    }
}
